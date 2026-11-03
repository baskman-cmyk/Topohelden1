# Topohelden F1 – West-Nederland

## Wat werkt
- Interactieve OpenStreetMap-kaart met Leaflet (internet vereist).
- Alle 36 namen uit de aangeleverde lijst, inclusief twee verschillende Utrecht-items (provincie en stad).
- Filteren op categorie en locatie selecteren via kaart of namenlijst.
- Eigen selectie van locaties, lokaal bewaard, export naar JSON.
- Leerjaar en periode selecteren voor JSON-export.
- F0-schermen en drie demovragen blijven beschikbaar.

## Nog niet klaar / beperkingen
- Coördinaten zijn handmatig ingevoerde, **niet onafhankelijk geverifieerde representatieve punten**. Niet gebruiken als definitieve topografische toetslocaties.
- Provincies, rivieren, kanalen en regio's zijn nog punten in plaats van nauwkeurige polygonen/lijnen.
- Oefenen gebruikt nog slechts drie F0-demovragen, niet alle 36 namen.
- Geen serveropslag, accounts, methode-import of echte adaptieve toets.
- De selectie wordt lokaal opgeslagen; groep/periode worden alleen meegenomen bij export.

## Deploy Vercel
Upload `index.html` naar de root van een GitHub-repository, importeer in Vercel met Framework Preset Other. De JSON-bestanden zijn voor verdere ontwikkeling en controle.
