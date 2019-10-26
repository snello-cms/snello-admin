# Snello ADMIN

To build:

npm install
ng build --prod


PER GESTIONE JOIN e MULTIJOIN

```
in FormGenerationListComponent va completato:
```
```
  if (fieldDefinition.type === 'join') {
            // TODO COME RECUPERO IL VALORE => FAREI CON ASYNC nella MASCHERA
            // path da invocare per avere i dati:
            // /api/{fieldDefinition.metadata_name}/{fullValue}
            return '[' + fullValue + ']';
        }
        if (fieldDefinition.type === 'multijoin') {
            let retVal = '';
            const splitted = fullValue.split(',');
            for (let x = 0; x < splitted.length; x++) {
                const label = splitted[x].split(':');
                retVal = retVal + label[1] + ',';
                 // TODO COME RECUPERO I VALORI => FAREI CON ASYNC nella MASCHERA
                // path da invocare per avere i dati:
                // /api/{metadata.table}/{uuid}/{fieldDefinition.metadata_name}
            }
            return retVal.substr(0, retVal.length - 1);
        }
```
