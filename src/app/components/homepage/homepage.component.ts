import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";

@Component(
  {
    templateUrl: "./homepage.component.html",
    styleUrls: ["./homepage.component.css"]
  }
)
export class HomepageComponent {

  items: any[] = [];

  constructor(private _route: ActivatedRoute,
              public router: Router) {

    this.items = [
      {
        id: "list",
        section: "metadata",
        name: "Metadati",
        summary: "Gestione dei metadati sulle tabelle"
      },
      {
        id: "list",
        section: "fielddefinition",
        name: "Field Definitions",
        summary: "Gestione definizione dei campi per popolare le form"
      },
      {
        id: "list",
        section: "condition",
        name: "Condition",
        summary: "Gestione delle condizioni di filtro delle tabelle"
      },
      {
        id: "list",
        section: "document",
        name: "Document",
        summary: "Gestione dei documenti"
      },

      {
        id: "metadata",
        section: "datalist",
        name: "Form Generation List",
        summary: "Simulazione di creazione di form e tabelle dinamiche"
      },

      {
        id: "",
        section: "example",
        name: "Esempio",
        summary: "Esempio di partenza modellato con i FieldDefinition"
      },
    ];
  }


}
