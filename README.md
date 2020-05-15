# HEIGVD-RES-2020-Labo-HTTPInfra

Les objectifs du laboratoire sont détaillés [ici](https://github.com/SoftEng-HEIGVD/Teaching-HEIGVD-RES-2020-Labo-HTTPInfra).

Remarques : 

Toutes les manipulations suivantes ont été realisées sous un environnement Windows.

Les manipulations concernant docker on été effectué à l'aide de "Docker Desktop on Windows".
 

## Étape 1 (fb-apache-static)

Le but de cette étape est de créer un serveur apache httpd "dockerisé" servant du contenu statique.

### Installer un serveur apache httpd et préparer une image docker qui va l'encapsuler 
Dans un premier temps j'ai créer le fichier "Dockerfile" (qui représentera la recette de configuration de l'image)

Ce fichier contient les instructions :

```
FROM php:7.2-apache

COPY src/ /var/www/html/
```

La première instruction permet d'alléger la configuration de l'image en récupérant une déja préconfigurée (ici une image php avec un serveur HTTP apache configuré)

La deuxième, copie notre dossier src local dans le dossier var/www/html de l'image (Cet emplacement peut-être modifié aux travers de son fichier de configuration)
 
Il y a donc 2 endroits principaux dans le serveur apache :

/var/ : Contenu de la page web

/etc/apache2/ : Contient les différents fichiers de configurations


### Ajouter du contenu HTML basique

Il faut créer un dossier du même nom que le dossier qui doit copié (ici src), au même niveau que le fichier Dockerfile et y placer du contenu.

J'ai donc crée un fichier index.html et afin d'amliorer l'aspect visuel j'ai récupéré un template de code mis à disposition par bootstrap pour avoir une page web présentable.

### Construction et execution de l'image

* Pour créer l'image :
```
docker build -t res/apache_php .
```
L'image crée se nomme "res/apache" 

le symbole "." signifie que l'on a va utiliser le répertoire courant comme contexte à la création de l'image

* Pour exécuter le docker avec l'image précédément crée :
```
docker run -p 9090:80 res/apache_php // mode interactive
docker run -d -p 9090:80 res/apache_php // en arrière plan
```


* Vérification :

On peut se connecter à l'aide de la commande :
```
telnet localhost 9090
```

ou via à navigateur à l'adresse http://localhost:9090/

## Étape 2 (fb-exress-dynamic)
Le but de cet étape est de créer une application web dynamique simple

### Écrire une application Node js qui va retourner des données JSON à la suite de requêtes GET

Dockerfile :
```
FROM node:12.16

COPY src /opt/app

CMD ["node", "/opt/app/index.js"]
```
Node.js est utilisé pour transmettre du contenu JSON dynamiquement.

La troisième instruction lance le script index.js au lancement d'un container sur la base de cette image.

Démarrer une application node js :
```
npm init
```
Cette commande va créer le fichier "package.json" et package lock ????

Installer le module "chance" (Pour générer des valeurs aléatoires)  et le framework "express" pour simplifier le code à écrire:
```
npm install --save chance
npm install --save express
```
crée le package node_modules et enregistre les dépendances dans le fichier package.json

Script index.js (Contient le code à exécuter au lancement) :

````
var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();
````
Chargement des modules

Il faut respecter la case sur Windows sinon erreur au lancement du container !
````
app.get('/', function(req,res) {
	res.send( generateStudents() );
});
````
Renvoie le résultat de la fonction generateStudents lorsqu'on se connect sur http://localhost:3000/
````
app.listen(3000, function () {
	console.log('Accepting HTTP requets on port 3000');
});
````
On se met à l'écoute sur le port 3000.

Créer l'image et lancer le container :
````
docker build -t res/express_students .
docker run -p 9090:3000 res/express_students 
````

* Vérification: 

cmd :
````
telnet localhost 3000
GET / HTTP/1.0 [\r\n]
````
Ne pas oublier le retour à la ligne !

navigateur :  
http://localhost:3000/

## Étape 3 (fb-apache-reverse-proxy)

#### Configurer un reverse proxy apache dans docker

Dockerfile :
````
FROM php:7.2-apache

COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
````

La commande copy n'écrase pas le contenu de Apache2  mais complète par nos fichiers.

a2enmod  : Permet d'activer des modules supplémentaires d'apache (ex mode proxy)

a2ensite : permet d'activer les virtual hosts configurés dans le dossier sites-available (Cela permet au serveur apache de servir plusieurs sites logiques)

Dossier conf : Contient le répertoire "sites-available" qui lui contient les fichiers de configuration des sites


sites-available :
* 000-default.conf

````
<VirtualHost *:80>
</VirtualHost>
````
Nécessaire au bon fonctionnement du reverse proxy. Sinon le virtual host du fichier 001-reverse-proxy.conf serait celui par défaut et
on pourrait aux accéder aux ressources de ce virtual host sans avoir à préciser le ServerName.

* 001-reverse-proxy.conf
````
<VirtualHost *:80>
	ServerName demo.res.ch
	
	#ErrorLog $[APACHE_LOG_DIR]/error.log
	#CustomLog $[APACHE_LOG_DIR]/access.log combined
	
	ProxyPass "/api/students/" "http://172.17.0.3:3000/"
	ProxyPassReverse "/api/students/" "http://172.17.0.3:3000/"
	
	ProxyPass "/" "http://172.17.0.2:80/"
	ProxyPassReverse "/" "http://172.17.0.2:80/"
</VirtualHost>
````

Notre container "res/apache_rp" ayant pour rôle d'être un reverse serveur proxy sera donc en charge de nous redirigé
sur les ressources des containers "res/apache_php" ou "express_dynamic" en fonction de l'url. 

ATTENTION : Ici les adresses des containers à atteindre sont stockées en dur. C'est à dire qu'il faut s'assurer qu'au lancement du reverse proxy
que ces 2 containeurs aient les mêmes addresses que ci-dessus. C'est donc une solution très fragile !

Lancement des services et du reverse serveur proxy : 
````
docker build -t res/apache_php .
docker build -t res/express_students .
docker build -t res/apache_rp .

docker run -d  res/express_students
docker run -p 8080:80 res/apache_rp
docker run -d  res/apache_php
````

Accès aux ressources :

Les ressources des containers apache_static et express_dynamic ne sont donc pas accessible directement. (Pas de port mapping sur ces containers).
Il est nécessaire de passer par le reverse proxy. (Port mapping sur 8080)

cmd :

````
telnet localhost 8080
GET / HTTP/1.0[\r\n] // ou GET /api/students/ HTTP/1.0[\r\n]
Host: demo.res.ch
````

navigateur :

Si on tente de se connecter sur localhost:8080 -> redirection sur le site par defaut

C'est parce que le navigateur doit envoyer l'en-tête "host". Pour ce faire, il faut modifier le fichier hosts de windows en ajoutant l'instruction suivante :

````
127.0.0.1       demo.res.ch
````
Ainsi on sera redirigé sur l'addresse du localhost lorsqu'on tentera d'atteindre demo.res.ch (résolution dns)

urls accessibles :
````
http://demo.res.ch:8080/
http://demo.res.ch:8080/api/students/
````



