# Sir Pommin Jäljillä - Web-sovellus

Tämä on "Sir Pommin Jäljillä" -pelin verkkosovellusversio. Pelaaja etsii kadonnutta superpalloa matkustamalla eri lentokentille ympäri maailmaa.

## Asennus

1. Asenna Python-riippuvuudet:
```bash
pip install -r requirements.txt
```

2. Varmista että MySQL-tietokanta on käynnissä ja että tietokanta `lentopeli` on olemassa.

3. Tietokantayhteyden asetukset löytyvät `database.py`-tiedostosta. Muokkaa tarvittaessa:
   - host
   - port
   - database
   - user
   - password

## Käynnistys

Käynnistä Flask-sovellus:
```bash
python app.py
```

Sovellus käynnistyy osoitteessa: `http://localhost:5000`

## Käyttö

1. Avaa selaimessa `http://localhost:5000`
2. Syötä käyttäjänimi ja aloita peli
3. Lue tarina (valinnainen)
4. Aloita peli ja lennä eri lentokentille ICAO-koodeilla
5. Vastaa kysymyksiin kerätäksesi motivaatiopisteitä
6. Etsi superpallo ja palaa Helsinkiin (EFHK) voittaaksesi!

## Projektirakenne

```
Superpallo_peli/
├── app.py              # Flask-sovellus ja API-endpointit
├── database.py          # Tietokantayhteydet ja -operaatiot
├── game_logic.py        # Pelilogiikka
├── questions.py         # Kysymysfunktiot
├── requirements.txt     # Python-riippuvuudet
├── templates/
│   ├── index.html       # Aloitusnäkymä
│   └── game.html        # Pelinäkymä
└── static/
    ├── css/
    │   ├── style.css    # Yleiset tyylit
    │   └── game.css     # Pelin tyylit
    └── js/
        ├── index.js     # Aloitusnäkymän JavaScript
        └── game.js      # Pelin JavaScript
```

## API-endpointit

- `POST /api/new_game` - Luo uusi peli
- `POST /api/fly` - Lentää kentältä toiselle
- `GET /api/get_question/<icao>` - Hae kysymys
- `POST /api/answer` - Tarkista vastaus
- `GET /api/game_state` - Hae pelitila
- `GET /api/airports` - Hae lentokentät

## Teknologiat

- Backend: Flask (Python)
- Frontend: HTML5, CSS3, JavaScript
- Kartta: Leaflet.js
- Tietokanta: MySQL

