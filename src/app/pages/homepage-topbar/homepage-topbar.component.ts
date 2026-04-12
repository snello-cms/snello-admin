import {Component, DestroyRef, ElementRef, HostListener, OnInit, ViewChild, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {DataListService} from '../../services/data-list.service';
import {ApiService} from '../../services/api.service';
import {MetadataService} from '../../services/metadata.service';
import {Metadata} from '../../models/metadata';

@Component({
    selector: 'homepage-topbar',
    standalone: true,
    templateUrl: './homepage-topbar.component.html',
    imports: [RouterLink],
    styles: [`
        :host {
            display: block;
            height: 100%;
        }

        .sidebar-search-panel {
            position: fixed;
            top: 72px;
            left: 86px;
            width: 280px;
            max-height: calc(100vh - 88px);
            display: flex;
            flex-direction: column;
            background: #ffffff;
            border: 1px solid #d7dfe8;
            border-radius: 10px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
            overflow: hidden;
            pointer-events: auto;
            z-index: 10050;
        }

        .sidebar-search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            border-bottom: 1px solid #e5e9f2;
        }

        .sidebar-search-box i {
            color: #667085;
        }

        .sidebar-search-box input {
            width: 100%;
            border: 0;
            outline: none;
            font-size: 13px;
            color: #31394d;
        }

        .sidebar-search-results {
            overflow-y: auto;
        }

        .sidebar-search-result {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            color: #31394d;
            text-decoration: none;
            border-left: 3px solid transparent;
        }

        .sidebar-search-result i {
            width: 18px;
            text-align: center;
        }

        .sidebar-search-result:hover {
            background: #f7f9fc;
            border-left-color: #f5445f;
        }

        .sidebar-search-empty {
            padding: 14px 12px;
            font-size: 13px;
            color: #667085;
        }
    `]
})
export class HomepageTopBar implements OnInit{
    private readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);
    readonly metadatasService = inject(MetadataService);
    readonly dataListService = inject(DataListService);
    private readonly apiService = inject(ApiService);
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

    model: Metadata[] = [];
    errorMessage = '';
    searchTerm = '';
    searchOpen = false;

    constructor() {
        this.model = [];
    }

    get visibleModel(): Metadata[] {
        return this.model.filter((component) => component.icon && (component.already_exist || component.created));
    }

    get filteredModel(): Metadata[] {
        const query = this.searchTerm.trim().toLowerCase();

        if (!query) {
            return this.visibleModel;
        }

        return this.visibleModel.filter((component) => {
            const searchableValues = [component.alias_table, component.table_name, component.description]
                .filter((value): value is string => Boolean(value));

            return searchableValues.some((value) => value.toLowerCase().includes(query));
        });
    }

    ngOnInit(): void {
        void this.route;
        void this.apiService;
        this.metadatasService.getListSearch({}, 0, 300).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: model => {
                this.model = <Metadata[]>model;
            },
            error: error => (this.errorMessage = <any>error)
        });
    }

    toggleSearch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.searchOpen = !this.searchOpen;

        if (this.searchOpen) {
            setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
        }
    }

    updateSearch(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value ?? '';
        this.searchOpen = true;
    }

    closeSearch(): void {
        this.searchOpen = false;
    }

    metadataLabel(component: Metadata): string {
        return component.alias_table || component.table_name || 'Metadata';
    }

    @HostListener('document:click')
    handleDocumentClick(): void {
        this.closeSearch();
    }

    @HostListener('document:keydown.escape')
    handleEscape(): void {
        this.closeSearch();
    }
}
