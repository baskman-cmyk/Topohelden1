# Topohelden – koerscorrectie en ontwerpstatus

3 november 2026. Het door Bas aangeleverde Masterplan v0.2 blijft leidend.
Dit bestand legt de huidige ontwerpbesluiten en bewijsbare prototypestatus vast.
De eerdere downloadnamen F1–F4 betekenen geen afronding van de gelijknamige
masterplanfasen.

## Besloten in deze iteratie

- Start bij zichtbare groepsknoppen 4, 5, 6, 7 en 8.
- De gekozen groep geeft richting, maar sluit geen beschikbare lijst uit.
- Daaronder aparte tegels Topografie en Aardrijkskunde, leerstof kiezen en leerroute.
- Dezelfde stijlbasis als de geïnspecteerde Taalhelden-code: tokens, typografie,
  actieve groepsknop, kaarten, knoppen, compacte header en voortgang naast de vakken.
- Rekenhelden bevestigt het patroon van groepskeuze boven vak-/oefentegels;
  de concrete visuele tokens komen uit Taalhelden omdat de bestanden verschillen.
- Groep/periode zijn programma-instellingen. Ze worden niet toegevoegd aan locaties.
- Eén lijst kan in meerdere groepen/periodes worden gebruikt, met een aparte
  selectie van bestaande locatie-ID's. Geen duplicatie van de 36 geografische records.
- Geen lijst voor een groep betekent een eerlijke lege staat met vrije bibliotheekkeuze.
- Geen nieuwe account-, database- of kaartproviderkeuze in deze UX-iteratie.

## Auditbronnen

Taalhelden-main.zip: index.html en style.css, inclusief level-picker/level-tile,
header-main-row, dashboard-main, tile-grid en dashboard-progress-card.
rekenhelden-main(1).zip: index.html en style.css, niveauGroep/level-picker en dashboard-grid.
Dit zijn de beschikbare archiefversies, niet noodzakelijk de actuele live versies.

## Toetsbare gebruikersroute

1. Open Start. Groep 6 is aanvankelijk actief, passend bij de bestaande West-Nederland-casus.
2. Kies groep 5 en periode 2: er is nog geen lijst toegewezen.
3. Open Topografie en kies West-Nederland uit de vrije bibliotheek.
4. Selecteer enkele namen. Ga naar groep 6/periode 1: de eerdere selectie blijft staan.
5. Ga terug naar groep 5/periode 2: de eigen selectie verschijnt opnieuw.
6. Sluit/heropen op dezelfde weborigin: groep, periode en programma's kunnen worden hersteld.
7. Open Aardrijkskunde: een groepgebonden thema-overzicht, duidelijk als in voorbereiding.

## Voortgangsregister tegenover het masterplan

| ID | Status | Aanwezig bewijs | Nog nodig |
|---|---|---|---|
| P01 Visuele audit | In uitwerking | Code-inspectie beide archieven, tokens in topo.css | Visuele review op telefoon/tablet en akkoord |
| P02 Wireframes/navigatie | In test | Werkend groepsdashboard en navigatie; logische tests | Browser-/touchtest en review |
| P03 Geografisch datamodel | In uitwerking | 36 gedeelde locatie-ID's | Schema, bronnen en echte geometrie |
| P04 Kaart/geometrie | In test | 3 provinciegrenzen, 5 vaarweglijnen, 1 BAG-punt; bronregister en geometriecontroles | Echte browsertest, waterdekking en onderwijsinhoudelijke review |
| P05 Lijsten/periodes | In ontwikkeling | Lokale programma's per groep/periode, aparte selecties, tests | Lijsteditor uitbreiden, profielen, versiebeheer |
| P06 Oefenengine | In ontwikkeling | Aanwijzen/herkennen van 20 plaatsen en 3 provincies; logische tests | Benoemen, geometrie, hervatbare sessies |
| P07 Toetsengine | Niet gestart | Geen | Afzonderlijke toets en reproduceerbare scoring |
| P08 Herhaling/voortgang | In ontwikkeling | Foutenherhaling en lokale totaalscore/per stad | Per leerling en vaardigheid, tijdsintervallen |
| P09 Aardrijkskunde | In uitwerking | Groepgebonden thema-overzicht | Werkelijke lessen en vraagvormen |
| P10 Privacy/toegankelijkheid | In uitwerking | Focus, knoppenalternatief en aria-pressed | Browseraudit en profielautorisatie |
| P11 West-Nederland pilot | Niet gestart | Geen geslaagde volledige WNL-01 | Alle 36 items met juiste geometrie en volledige leerlingflow |

Geen werkpakket is in deze iteratie als Gereed afgevinkt.

## Validatie en beperkingen

`node check-training.cjs` test de applicatielogica met gesimuleerde DOM/kaart:
score, foutenherhaling, opslag, migratie, foutafhandeling, groep/periode wisselen,
lijst hergebruiken en onafhankelijke selecties. Dit bewijst geen correcte kaartdata
of visuele bruikbaarheid. Er is nog geen geslaagde echte browsertest.

Oefenen ondersteunt alleen 20 steden. De overige 16 objecten blijven indicatieve
punten op de leerkaart; zij zijn niet geografisch gevalideerd. Voortgang is nog
gedeeld binnen deze browser, niet gescheiden per kind of antwoordvaardigheid.
De groepindeling is een voorgestelde route, geen officiële SLO-indeling.

## Eerstvolgende stap

Eerst het dashboard en de route groep → vak → lijst/selectie → kaart visueel
beoordelen. Daarna de kaart-PoC voor één provincie, één rivier en één stad.
De overige leerstof en toetsengine volgen pas langs de exitcriteria van het masterplan.

## Geometrie-iteratie na de koerscorrectie
- Drie provincies met vereenvoudigde Kadaster-/PDOK-grenzen in leerkaart en oefeningen.
- Vijf NWB-vaarweglijnen op de leerkaart; nog niet geschikt verklaard voor toetsing.
- Vleuten als BAG-woonplaatsmiddelpunt; de overige 19 punten niet blind gewijzigd naar geocodercentroïden.
- Oefencategorieën plaatsen/provincies met antwoordopties van hetzelfde objecttype.
- Groeps-/periodeselecties, opslag, herhaling en voortgang blijven werken.
- Bronregistratie: BRONNEN_EN_GEOMETRIE.md; technische controles: geometry-checks.json, check-geodata.cjs en check-training.cjs.
- P04 blijft In test; WNL-01 en F1/F2 zijn niet als Gereed afgevinkt.
- Volgende inhoudelijke stappen: resterende geografie, waterdekking en echte browser-/aanraaktest.
