# Importer RPL

Narzędzie pobiera oficjalny raport XML Rejestru Produktów Leczniczych i generuje
lokalny katalog używany przez aplikację.

```bash
npm run import:rpl
npm run validate:rpl
```

Można również przetworzyć wcześniej pobrany plik:

```bash
node tools/rpl-importer/import.mjs --input raport.xml --output src/data/rpl-drugs.json
```

Importer nie ustawia kalkulatorów, `highRisk` ani zaleceń. Te informacje pozostają
ręcznie utrzymywane w `src/metadata/productMetadata.json`.
