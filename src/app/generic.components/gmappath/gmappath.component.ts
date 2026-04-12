import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, model } from '@angular/core';
import { FormsModule, UntypedFormGroup } from '@angular/forms';
import * as L from 'leaflet';
import { FieldDefinition } from '../../models/field-definition';
import {
  addBaseTileLayer,
  AddressSearchResult,
  DEFAULT_MAP_CENTER,
  formatPoint,
  LEAFLET_DEFAULT_ICON,
  parsePoint,
  searchNominatim,
  splitPath
} from '../map-utils';

@Component({
  selector: 'gmappath',
  templateUrl: './gmappath.component.html',
  styleUrls: ['./gmappath.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class GMapPathComponent {
  value = model('');
  field: FieldDefinition;
  group: UntypedFormGroup;

  showMap = false;
  path: string[] = [];
  searchQuery = '';
  searchResults: AddressSearchResult[] = [];
  searchLoading = false;
  searchError = '';
  private originalValue = '';

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  map?: L.Map;
  markers: L.Marker[] = [];
  polyline?: L.Polyline;

  get currentValue(): string {
    const controlValue = this.field.name ? this.group.get(this.field.name)?.value : null;
    return controlValue || this.value() || '';
  }

  get currentPath(): string[] {
    return splitPath(this.currentValue);
  }

  openMap() {
    this.originalValue = this.currentValue;
    this.path = [...this.currentPath];
    this.searchResults = [];
    this.searchError = '';
    this.showMap = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.initMap());
    });
  }

  closeMap(commit = false) {
    if (!commit) {
      this.path = splitPath(this.originalValue);
    }

    this.showMap = false;
    this.destroyMap();
    this.searchResults = [];
    this.searchError = '';
  }

  private syncValue(nextValue: string) {
    this.value.set(nextValue);

    if (this.field.name) {
      const control = this.group.get(this.field.name);
      control?.setValue(nextValue);
      control?.markAsDirty();
      control?.markAsTouched();
      control?.updateValueAndValidity({ emitEvent: true });
    }
  }

  addPoint(lat: number, lng: number) {
    this.path.push(formatPoint(lat, lng));
    this.updatePolyline();
  }

  removePoint(idx: number) {
    this.path.splice(idx, 1);

    if (this.map && this.markers[idx]) {
      this.map.removeLayer(this.markers[idx]);
      this.markers.splice(idx, 1);
    }

    this.updatePolyline();
  }

  confirmPath() {
    this.syncValue(this.path.join('; '));
    this.closeMap(true);
  }

  async searchAddress() {
    const query = this.searchQuery.trim();

    if (!query) {
      this.searchResults = [];
      this.searchError = 'Type an address to search.';
      return;
    }

    this.searchLoading = true;
    this.searchResults = [];
    this.searchError = '';

    try {
      this.searchResults = await searchNominatim(query);

      if (!this.searchResults.length) {
        this.searchError = 'No address found.';
      }
    } catch (error) {
      this.searchError = 'Address search is currently unavailable.';
    } finally {
      this.searchLoading = false;
    }
  }

  selectSearchResult(result: AddressSearchResult) {
    this.searchQuery = result.label;
    this.searchResults = [];
    this.searchError = '';
    this.addMarker(result.lat, result.lng);
    this.addPoint(result.lat, result.lng);
    this.map?.setView([result.lat, result.lng], 15);
  }

  initMap() {
    if (!this.mapContainer?.nativeElement) {
      return;
    }

    this.destroyMap();

    const firstPoint = parsePoint(this.path[0]);
    this.map = L.map(this.mapContainer.nativeElement).setView(firstPoint ?? DEFAULT_MAP_CENTER, firstPoint ? 15 : 13);

    addBaseTileLayer(this.map);

    this.path.forEach((point) => {
      const parsedPoint = parsePoint(point);
      if (parsedPoint) {
        this.addMarker(parsedPoint[0], parsedPoint[1]);
      }
    });
    this.updatePolyline();
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.addMarker(lat, lng);
      this.addPoint(lat, lng);
    });

    this.map.whenReady(() => {
      setTimeout(() => this.map?.invalidateSize(), 150);
    });
  }

  private destroyMap() {
    this.map?.remove();
    this.map = undefined;
    this.markers = [];
    this.polyline = undefined;
  }

  addMarker(lat: number, lng: number) {
    if (!this.map) {
      return;
    }

    const marker = L.marker([lat, lng], { draggable: true, icon: LEAFLET_DEFAULT_ICON }).addTo(this.map);
    marker.on('dragend', (e: L.DragEndEvent) => {
      const latlng = (e.target as L.Marker).getLatLng();
      const idx = this.markers.indexOf(marker);
      if (idx !== -1) {
        this.path[idx] = formatPoint(latlng.lat, latlng.lng);
        this.updatePolyline();
      }
    });
    this.markers.push(marker);
  }

  updatePolyline() {
    if (!this.map) {
      return;
    }

    if (this.polyline) {
      this.map.removeLayer(this.polyline);
    }

    const latlngs = this.path
      .map((point) => parsePoint(point))
      .filter((point): point is [number, number] => Array.isArray(point));

    if (latlngs.length) {
      this.polyline = L.polyline(latlngs, { color: 'blue' }).addTo(this.map);
    } else {
      this.polyline = undefined;
    }
  }
}
