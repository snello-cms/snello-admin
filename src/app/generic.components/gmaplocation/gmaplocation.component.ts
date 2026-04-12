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
  searchNominatim
} from '../map-utils';

@Component({
  selector: 'gmaplocation',
  templateUrl: './gmaplocation.component.html',
  styleUrls: ['./gmaplocation.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class GMapLocationComponent {
  value = model('');
  field: FieldDefinition;
  group: UntypedFormGroup;

  showMap = false;
  selectedLocation = '';
  searchQuery = '';
  searchResults: AddressSearchResult[] = [];
  searchLoading = false;
  searchError = '';
  private originalValue = '';

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  map?: L.Map;
  marker?: L.Marker;

  get currentValue(): string {
    const controlValue = this.field.name ? this.group.get(this.field.name)?.value : null;
    return controlValue || this.value() || '';
  }

  openMap() {
    this.originalValue = this.currentValue;
    this.selectedLocation = this.currentValue;
    this.searchResults = [];
    this.searchError = '';
    this.showMap = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.initMap());
    });
  }

  closeMap(commit = false) {
    if (!commit && this.originalValue !== this.currentValue) {
      this.syncValue(this.originalValue);
    }

    this.showMap = false;
    this.destroyMap();
  }

  confirmLocation() {
    if (this.selectedLocation) {
      this.syncValue(this.selectedLocation);
    }
    this.closeMap(true);
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

  private updateSelectedLocation(lat: number, lng: number) {
    const nextValue = formatPoint(lat, lng);
    this.selectedLocation = nextValue;
    this.syncValue(nextValue);
  }

  private destroyMap() {
    this.map?.remove();
    this.map = undefined;
    this.marker = undefined;
  }

  async searchAddress() {
    const query = this.searchQuery.trim();

    if (!query) {
      this.searchResults = [];
      this.searchError = 'Type an address to search.';
      return;
    }

    this.searchLoading = true;
    this.searchError = '';
    this.searchResults = [];

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
    this.marker?.setLatLng([result.lat, result.lng]);
    this.map?.setView([result.lat, result.lng], 15);
    this.updateSelectedLocation(result.lat, result.lng);
  }

  initMap() {
    if (!this.mapContainer?.nativeElement) {
      return;
    }

    this.destroyMap();

    const initialPoint = parsePoint(this.selectedLocation || this.currentValue);
    const center = initialPoint ?? DEFAULT_MAP_CENTER;

    this.map = L.map(this.mapContainer.nativeElement, {
      center,
      zoom: initialPoint ? 15 : 13
    });

    addBaseTileLayer(this.map);

    this.marker = L.marker(center, { draggable: true, icon: LEAFLET_DEFAULT_ICON }).addTo(this.map);

    if (initialPoint) {
      this.selectedLocation = formatPoint(initialPoint[0], initialPoint[1]);
    }

    this.marker.on('dragend', (e: L.DragEndEvent) => {
      const latlng = (e.target as L.Marker).getLatLng();
      this.updateSelectedLocation(latlng.lat, latlng.lng);
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.marker?.setLatLng([lat, lng]);
      this.updateSelectedLocation(lat, lng);
    });

    this.map.whenReady(() => {
      setTimeout(() => this.map?.invalidateSize(true), 150);
    });
  }
}
