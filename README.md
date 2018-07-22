This tool has been developped for the GDG Lille in order to generate the convention and invoice for the Devfest Lille. Those documents will be created in a 'tmp' folder and also uploaded on Google Drive.

# Getting Started

Before using this module, you should first enable the Drive API in the Cloud Console. You can follow the Step #1 described in the official documentation : https://developers.google.com/drive/api/v3/quickstart/nodejs

The file you will download should be named credentials.json and located in the root folder of the project

The template for the convention and the invoice are located in the templates folder.

## Solution #1 : Command Line

```shell
git clone sponsoring-generator
npm i

GDG_CITY=LILLE GDG_CP=59000 GDG_ADDRESS="Grand Place" npm run cli
```

The GDG_CITY, GDG_CP=59000 and GDG_ADDRESS give the possibility to configure the address of the GDG.

## Solution #2 : Server

```shell
git clone sponsoring-generator
npm i

GDG_CITY=LILLE GDG_CP=59000 GDG_ADDRESS="Grand Place" npm run server
curl -X POST  -H "Accept: Application/json" -H "Content-Type: application/json" http://localhost:8080/generate -d '
{ "company": "Zenika",
  "address": "19 Avenue Saint-Maur",
  "cp": "59110",
  "city": "La Madeleine",
  "contact": "Emmanuel DEMEY",
  "role": "CTO",
  "siret": "123123",
  "sponsoring": "gold" }'
```

The GDG_CITY, GDG_CP=59000 and GDG_ADDRESS give the possibility to configure the address of the GDG.
