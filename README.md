# Wie betaalt wie

Vue 3-app om gezamenlijke kosten gelijk te verdelen. Vul namen en totaalbedragen in; de app berekent het kleinst mogelijke aantal overboekingen (minimum cash-flow).

Data blijft in de browser (`localStorage`) en in de URL-hash, zodat je een link kunt delen zonder dat namen of bedragen naar een server gaan.

## Lokaal draaien

```bash
npm install
npm run dev
```

Productiebuild:

```bash
npm run build
npm run preview
```

## Deployen naar Vercel

1. Zet dit project in een Git-repo (GitHub, GitLab of Bitbucket).
2. Ga naar [vercel.com/new](https://vercel.com/new) en importeer de repo.
3. Framework Preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy. Open de live-URL, vul data in, kopieer de deelbare link en test die in een privévenster.

Geen extra `vercel.json` nodig: de app is één pagina; de staat zit in `#s=...`.
