const SUPABASE_URL = "https://jragildtoksjhnwbktuf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYWdpbGR0b2tzamhud2JrdHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3ODQ1NjgsImV4cCI6MjEwNTM2MDU2OH0._QdwF5gvPPSqeE4Prfg1fTNZ-hLxP4pf8pf6ae-8kXU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let derive = null;

function teinteDe(hsl) {
    return Number(hsl.replace("hsl(", "").split(",")[0]);
}

function ecartTeinte(a, b) {
    let d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
}

function tirerAmbiance() {
    let choisies = [];
    let essais = 0;

    while (choisies.length < 3 && essais < 500) {
        essais = essais + 1;
        let tirage = nuancier[Math.floor(Math.random() * nuancier.length)];
        let h = teinteDe(tirage.hsl);
        let tropProche = choisies.filter(function(c) {
            return ecartTeinte(teinteDe(c.hsl), h) < 40;
        });
        if (tropProche.length === 0) {
            choisies.push(tirage);
        }
    }

    return [choisies[0].hsl, choisies[1].hsl, choisies[2].hsl, choisies[0].hsl, choisies[1].hsl];
}

function appliquerAmbiance(couleurs) {
    for (let i = 0; i < couleurs.length; i++) {
        document.documentElement.style.setProperty("--c" + (i + 1), couleurs[i]);
    }
    document.documentElement.style.setProperty("--couleur-session", couleurs[0]);
}

function demarrerFondAleatoire() {
    appliquerAmbiance(tirerAmbiance());
    if (derive === null) {
        derive = setInterval(function() {
            appliquerAmbiance(tirerAmbiance());
        }, 20000);
    }
}

function fondNeutre() {
    if (derive !== null) {
        clearInterval(derive);
        derive = null;
    }
    for (let i = 1; i <= 5; i++) {
        document.documentElement.style.setProperty("--c" + i, "#f5f3ef");
    }
    document.documentElement.style.setProperty("--couleur-session", "#f5f3ef");
}

fondNeutre();

let vetements = [];
let idEnModification = null;
let idTenueEnModification = null;
let positionAvantModif = 0;

let sousCategories = {
    "Haut": ["T-shirt", "Chemise", "Chemisier", "Blouse", "Polo", "Pull", "Gilet", "Cardigan", "Sweat", "Débardeur", "Top", "Body", "Bustier", "Veste", "Blazer", "Manteau", "Trench", "Parka", "Doudoune", "K-way", "Maillot de sport"],
    "Bas": ["Pantalon", "Jean", "Chino", "Short", "Bermuda", "Jupe", "Jupe-culotte", "Legging", "Collant", "Bas", "Jogging", "Cycliste"],
    "Pièce entière": ["Robe", "Combinaison", "Salopette", "Costume", "Tailleur", "Ensemble", "Maillot de bain"],
    "Chaussure": ["Basket", "Soulier", "Derby", "Mocassin", "Escarpin", "Botte", "Bottine", "Cuissarde", "Sandale", "Ballerine", "Mule", "Espadrille", "Chausson"],
    "Accessoire": ["Ceinture", "Cravate", "Nœud papillon", "Écharpe", "Foulard", "Châle", "Étole", "Chapeau", "Casquette", "Bonnet", "Béret", "Gant", "Sac", "Bijou", "Lunettes", "Montre", "Broche", "Barrette"]
};

function remplirSousCategories(categorie) {
    let laListe = document.getElementById("liste-sous-categories");
    laListe.innerHTML = "";
    if (sousCategories[categorie] !== undefined) {
        let liste = sousCategories[categorie];
        for (let i = 0; i < liste.length; i++) {
            laListe.innerHTML = laListe.innerHTML + "<option value='" + liste[i] + "'>";
        }
    }
    champSousCategorie.value = "";
}


let champNom = document.getElementById("champ-nom");
let champCategorie = document.getElementById("champ-categorie");
let champSousCategorie = document.getElementById("champ-sous-categorie");
let champCouleur = document.getElementById("champ-couleur");
let champNuance = document.getElementById("champ-nuance");
let champMatiere = document.getElementById("champ-matiere");
let champMarque = document.getElementById("champ-marque");
let btnAjouter = document.getElementById("btn-ajouter");
let btnAnnuler = document.getElementById("btn-annuler");

let liste = document.getElementById("liste-vetements");

let champTenueNom = document.getElementById("champ-tenue-nom");
let zoneTenueVetements = document.getElementById("zone-tenue-vetements");
let btnCreerTenue = document.getElementById("btn-creer-tenue");
let btnAnnulerTenue = document.getElementById("btn-annuler-tenue");
let listeTenues = document.getElementById("liste-tenues");

let champOccasion = document.getElementById("champ-occasion");
let champSaison = document.getElementById("champ-saison");
let champRegistre = document.getElementById("champ-registre");
let champEclat = document.getElementById("champ-eclat");

let rechOccasion = document.getElementById("rech-occasion");
let rechSaison = document.getElementById("rech-saison");
let rechRegistre = document.getElementById("rech-registre");
let rechEclat = document.getElementById("rech-eclat");
let btnRechercher = document.getElementById("btn-rechercher");
let btnReset = document.getElementById("btn-reset");

let btnExporter = document.getElementById("btn-exporter");

champCategorie.addEventListener("change", function() {
    remplirSousCategories(champCategorie.value);
});

function afficher(items) {
    liste.innerHTML = "";
    for (let i = 0; i < items.length; i++) {
        liste.innerHTML = liste.innerHTML + "<li>" + items[i].nom + " — " + items[i].sousCategorie + " — " + items[i].couleur.join(", ") + " " + items[i].nuance + " — " + items[i].marque + " <button class='btn-modifier' data-id='" + items[i].id + "'>modifier</button> <button class='btn-supprimer' data-id='" + items[i].id + "'>x</button></li>";
    }
    activerSuppression();
    activerModification();
}

btnAjouter.addEventListener("click", async function() {
    if (champNom.value === "") {
        alert("Donnez un nom au vêtement.");
        return;
    }

    let saisie = {
        nom: champNom.value,
        categorie: champCategorie.value,
        sousCategorie: champSousCategorie.value,
        couleur: champCouleur.value ? [champCouleur.value] : [],
        teinte: teinteChoisie || null,
        nuance: champNuance.value,
        matiere: champMatiere.value,
        marque: marqueUniformisee(champMarque.value)    };

    let ok;
    if (idEnModification !== null) {
        ok = await modifierVetement(idEnModification, saisie);
    } else {
        ok = await ajouterVetement(saisie);
    }

    if (!ok) {
        return;
    }

    await rafraichirVetements();
    sortirDeModification();
});

function activerSuppression() {
    let boutons = document.querySelectorAll(".btn-supprimer");
    for (let i = 0; i < boutons.length; i++) {
                boutons[i].addEventListener("click", async function() {
            let id = Number(this.getAttribute("data-id"));
            let ok = await supprimerVetement(id);
            if (ok) {
                await rafraichirVetements();
            }
        });
    }
}

function activerModification() {
    let boutons = document.querySelectorAll(".btn-modifier");
    for (let i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener("click", function() {
            let id = Number(this.getAttribute("data-id"));
            let trouve = vetements.filter(function(v) {
                return v.id === id;
            });
            let v = trouve[0];

            champNom.value = v.nom;
            champCategorie.value = v.categorie;
            remplirSousCategories(v.categorie);
            champSousCategorie.value = v.sousCategorie;
            champNuance.value = v.nuance;
            champMatiere.value = v.matiere;
            champMarque.value = v.marque;

            champCouleur.value = v.couleur[0] || "";
            teinteChoisie = v.teinte || "";
            afficherNuances(champCouleur.value);

            idEnModification = id;
            btnAjouter.innerHTML = "Enregistrer";
            btnAnnuler.style.display = "inline-block";
        });
    }
}
    

function activerSuppressionTenues() {
    let boutons = document.querySelectorAll(".btn-supprimer-tenue");
    for (let i = 0; i < boutons.length; i++) {
                boutons[i].addEventListener("click", async function() {
            let id = Number(this.getAttribute("data-id"));
            let ok = await supprimerTenue(id);
            if (ok) {
                await rafraichirTenues();
            }
        });
    }
}

let tenues = [];

function remplirMenuVetements() {
    zoneTenueVetements.innerHTML = "";
    let categories = Object.keys(sousCategories);    
    for (let c = 0; c < categories.length; c++) {
        let dansCategorie = vetements.filter(function(v) {
            return v.categorie === categories[c];
        });

        if (dansCategorie.length === 0) {
            continue;
        }

        let contenu = "";
        let sousListe = sousCategories[categories[c]];

        for (let s = 0; s < sousListe.length; s++) {
            let dedans = dansCategorie.filter(function(v) {
                return v.sousCategorie === sousListe[s];
            });
            if (dedans.length > 0) {
                contenu = contenu + "<h5>" + sousListe[s] + "</h5>";
                contenu = contenu + casesPour(dedans);
            }
        }

        let restants = dansCategorie.filter(function(v) {
            return !v.sousCategorie;
        });
        if (restants.length > 0) {
            contenu = contenu + casesPour(restants);
        }

        zoneTenueVetements.innerHTML = zoneTenueVetements.innerHTML +
            "<details class='bloc-categorie'>" +
            "<summary>" + categories[c] + " (" + dansCategorie.length + ")</summary>" +
            contenu +
            "</details>";
    }
}

function casesPour(liste) {
    let texte = "";
    for (let i = 0; i < liste.length; i++) {
        texte = texte + "<label><input type='checkbox' class='case-vetement' value='" +
            liste[i].id + "'> " + liste[i].nom + "</label><br>";
    }
    return texte;
}


btnCreerTenue.addEventListener("click", async function() {
    if (champTenueNom.value === "") {
        alert("Donnez un nom à la tenue.");
        return;
    }

    let idsSelectionnes = Array.from(document.querySelectorAll(".case-vetement:checked")).map(function(c) {
        return Number(c.value);
    });

    let proche = chercherTenueProche(idsSelectionnes);
    if (proche) {
        let message = "Une tenue très proche existe déjà :\n\n" +
            proche.nom + "\n" + compositionDe(proche) +
            "\n\nCréer quand même ?";
        if (!confirm(message)) {
            return;
        }
    }

    let saisie = {
        nom: champTenueNom.value,
        vetementIds: idsSelectionnes,
        occasion: champOccasion.value,
        saison: Array.from(champSaison.selectedOptions).map(function(o) {
            return o.value;
        }),
        registre: champRegistre.value,
        eclat: champEclat.value
    };

    let ok = await enregistrerTenue(saisie, idTenueEnModification);
    if (!ok) {
        return;
    }

    await rafraichirTenues();
    sortirDeModificationTenue();
});

btnRechercher.addEventListener("click", function() {
    let resultat = tenues.filter(function(t) {
        if (rechOccasion.value !== "" && t.occasion !== rechOccasion.value) {
            return false;
        }
        if (rechSaison.value !== "" && t.saison.indexOf(rechSaison.value) === -1) {
            return false;
        }
        if (rechRegistre.value !== "" && t.registre !== rechRegistre.value) {
            return false;
        }
        if (rechEclat.value !== "" && t.eclat !== rechEclat.value) {
            return false;
        }
        return true;
    });
    document.getElementById("bloc-tenues").open = true;
    afficherTenues(resultat);
});

btnReset.addEventListener("click", function() {
    document.getElementById("bloc-tenues").open = true;
    afficherTenues(tenues);
});

function afficherTenues(items) {
    listeTenues.innerHTML = "";
    document.getElementById("titre-tenues").innerHTML = "Mes tenues (" + items.length + ")";
    for (let i = 0; i < items.length; i++) {       
    listeTenues.innerHTML = listeTenues.innerHTML + "<li>" + pastillesTenue(items[i]) + "<strong>" + items[i].nom + "</strong> — " + items[i].occasion + " — " + items[i].saison.join("/") + " — " + items[i].registre + " — " + items[i].eclat + "<br>" + composerTenue(items[i]) + " <button class='btn-modifier-tenue' data-id='" + items[i].id + "'>modifier</button> <button class='btn-supprimer-tenue' data-id='" + items[i].id + "'>x</button></li>";
    }

    activerSuppressionTenues(tenues);
    activerClicPieces();
    activerModificationTenue();
}

btnExporter.addEventListener("click", function() {
    let tout = { vetements: vetements, tenues: tenues };
    let texte = JSON.stringify(tout);
    let fichier = new Blob([texte], { type: "application/json" });
    let lien = document.createElement("a");
    lien.href = URL.createObjectURL(fichier);
    lien.download = "id-sauvegarde.json";
    lien.click();
});


let onglets = document.querySelectorAll(".onglet");

function afficherSection(nom) {
    let sections = document.querySelectorAll("#contenu section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.remove("active");
    }
    document.getElementById("section-" + nom).classList.add("active");

    for (let i = 0; i < onglets.length; i++) {
        onglets[i].classList.remove("onglet-actif");
        if (onglets[i].dataset.section === nom) {
            onglets[i].classList.add("onglet-actif");
        }
    }
}

for (let i = 0; i < onglets.length; i++) {
    onglets[i].addEventListener("click", function() {
        afficherSection(this.dataset.section);
    });
}

afficherSection("tenues");

function activerClicPieces() {
    let pieces = document.querySelectorAll(".piece");
    for (let i = 0; i < pieces.length; i++) {
        pieces[i].addEventListener("click", function() {
            montrerFrequence(Number(this.dataset.id));
        });
    }
}

function montrerFrequence(id) {
    let vetement = vetements.find(function(v) { return v.id === id; });
    if (!vetement) { return; }

    let concernees = tenues.filter(function(t) {
        return t.vetementIds.indexOf(id) !== -1;
    });

    let texte = "<h5>" + vetement.nom + "</h5>";
    texte = texte + "<p>Présent dans " + concernees.length + " tenue(s) sur " + tenues.length + ".</p>";

    if (concernees.length > 0) {
        for (let i = 0; i < concernees.length; i++) {
            let pieces = concernees[i].vetementIds.map(function(vid) {
                let trouve = vetements.filter(function(v) {
                    return v.id === vid;
                });
                if (trouve.length === 0) {
                    return "?";
                }
                if (vid === id) {
                    return "<em class='piece-cible'>" + trouve[0].nom + "</em>";
                }
                return trouve[0].nom;
            });
            texte = texte + "<div class='tenue-freq'><strong>" + concernees[i].nom + "</strong><br>" + pieces.join(" + ") + "</div>";
        }
    }

    texte = texte + "<button id='btn-fermer-frequence'>Fermer</button>";

    let zone = document.getElementById("zone-frequence");
    zone.innerHTML = texte;
    zone.style.display = "block";

    document.getElementById("btn-fermer-frequence").addEventListener("click", function() {
        zone.style.display = "none";
    });
}

function sortirDeModification() {
    idEnModification = null;
    btnAjouter.innerHTML = "Ajouter";
    btnAnnuler.style.display = "none";
    champNom.value = "";
    champNuance.value = "";
    champMatiere.value = "";
    champMarque.value = "";
    champCategorie.value = "";
    remplirSousCategories("");

    champCouleur.value = "";
    teinteChoisie = "";
    document.getElementById("zone-nuances").innerHTML = "";
}

btnAnnuler.addEventListener("click", sortirDeModification);

function chercherTenueProche(ids) {
    for (let i = 0; i < tenues.length; i++) {
        if (tenues[i].id === idTenueEnModification) {
            continue;
        }
        let communs = 0;
        for (let j = 0; j < ids.length; j++) {
            if (tenues[i].vetementIds.indexOf(ids[j]) !== -1) {
                communs = communs + 1;
            }
        }
        let ecartA = ids.length - communs;
        let ecartB = tenues[i].vetementIds.length - communs;
        if (ecartA <= 1 && ecartB <= 1) {
            return tenues[i];
        }
    }
    return null;
}

function compositionDe(tenue) {
    let noms = tenue.vetementIds.map(function(vid) {
        let trouve = vetements.filter(function(v) { return v.id === vid; });
        return trouve.length === 0 ? "?" : trouve[0].nom;
    });
    return noms.join(" + ");
}

function activerModificationTenue() {
    let boutons = document.querySelectorAll(".btn-modifier-tenue");
    for (let i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener("click", function() {
            positionAvantModif = window.scrollY;
            let id = Number(this.getAttribute("data-id"));
            let trouve = tenues.filter(function(t) {
                return t.id === id;
            });
            let t = trouve[0];

            champTenueNom.value = t.nom;
            champOccasion.value = t.occasion;
            champRegistre.value = t.registre;
            champEclat.value = t.eclat;

            for (let j = 0; j < champSaison.options.length; j++) {
                champSaison.options[j].selected = t.saison.indexOf(champSaison.options[j].value) !== -1;
            }

            let cases = document.querySelectorAll(".case-vetement");
            for (let j = 0; j < cases.length; j++) {
                cases[j].checked = t.vetementIds.indexOf(Number(cases[j].value)) !== -1;
            }

            idTenueEnModification = id;
            btnCreerTenue.innerHTML = "Enregistrer";
            btnAnnulerTenue.style.display = "inline-block";
            champTenueNom.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }
}

function sortirDeModificationTenue() {
    let revenir = idTenueEnModification !== null;
    idTenueEnModification = null;
    btnCreerTenue.innerHTML = "Créer";
    btnAnnulerTenue.style.display = "none";
    champTenueNom.value = "";
    champOccasion.value = "";
    champRegistre.value = "";
    champEclat.value = "";

    for (let j = 0; j < champSaison.options.length; j++) {
        champSaison.options[j].selected = false;
    }
    let cases = document.querySelectorAll(".case-vetement");
    for (let j = 0; j < cases.length; j++) {
        cases[j].checked = false;
    }
    if (revenir) {
    window.scrollTo({ top: positionAvantModif, behavior: "smooth" });
    }
}

btnAnnulerTenue.addEventListener("click", sortirDeModificationTenue);

let intro = document.getElementById("intro");
let introTitre = document.getElementById("intro-titre");
let introTexte = document.getElementById("intro-texte");

function lancerIntro() {
    setTimeout(function() {
        introTitre.style.opacity = 0;
        setTimeout(function() {
            introTitre.style.display = "none";
            introTexte.style.display = "block";
            setTimeout(function() {
                introTexte.classList.add("visible");
            }, 50);
        }, 1200);
    }, 2500);
}

intro.addEventListener("click", function() {
    demarrerFondAleatoire();
    intro.classList.add("efface");
    document.querySelector("#barre h1").classList.add("arrive");
    setTimeout(function() {
        intro.style.display = "none";
    }, 1000);
});

let filtresInventaire = document.getElementById("filtres-inventaire");

function construireFiltres() {
    let texte = "<button class='filtre' data-type='tous'>Tous</button>";
    let categories = Object.keys(sousCategories);    
    for (let c = 0; c < categories.length; c++) {
        texte = texte + "<details class='bloc-filtre'>";
        texte = texte + "<summary>" + categories[c] + "</summary>";
        texte = texte + "<button class='filtre' data-type='categorie' data-valeur='" + categories[c] + "'>Tous les " + categories[c].toLowerCase() + "s</button>";

        let sousListe = sousCategories[categories[c]];
        for (let s = 0; s < sousListe.length; s++) {
            let combien = vetements.filter(function(v) {
                return v.sousCategorie === sousListe[s];
            }).length;
            if (combien > 0) {
                texte = texte + "<button class='filtre' data-type='sous' data-valeur='" + sousListe[s] + "'>" + sousListe[s] + " (" + combien + ")</button>";
            }
        }
        texte = texte + "</details>";
    }

    filtresInventaire.innerHTML = texte;

    let boutons = document.querySelectorAll(".filtre");
    for (let i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener("click", function() {
            appliquerFiltre(this.dataset.type, this.dataset.valeur);
        });
    }
}

function appliquerFiltre(type, valeur) {
    if (type === "tous") {
        afficher(vetements);
        return;
    }
    let champ = type === "categorie" ? "categorie" : "sousCategorie";
    let resultat = vetements.filter(function(v) {
        return v[champ] === valeur;
    });
    afficher(resultat);
}

let curseur = document.getElementById("curseur");
let anneau = document.getElementById("curseur-anneau");
let cibleX = 0;
let cibleY = 0;
let anneauX = 0;
let anneauY = 0;

document.addEventListener("mousemove", function(e) {
    cibleX = e.clientX;
    cibleY = e.clientY;
    curseur.style.left = cibleX + "px";
    curseur.style.top = cibleY + "px";
});

function suivreAnneau() {
    anneauX = anneauX + (cibleX - anneauX) * 0.18;
    anneauY = anneauY + (cibleY - anneauY) * 0.18;
    anneau.style.left = anneauX + "px";
    anneau.style.top = anneauY + "px";
    requestAnimationFrame(suivreAnneau);
}

suivreAnneau();

document.addEventListener("mouseover", function(e) {
    let cible = e.target;
    if (cible.tagName === "BUTTON" || cible.tagName === "SUMMARY" ||
        cible.tagName === "LABEL" || cible.tagName === "INPUT" ||
        cible.tagName === "SELECT" || cible.classList.contains("piece")) {
        anneau.classList.add("actif");
    } else {
        anneau.classList.remove("actif");
    }
});

function composerTenue(tenue) {
    let morceaux = tenue.vetementIds.map(function(id) {
        return nomCliquable(id);
    });
    return morceaux.join(" + ");
}

function nomCliquable(id) {
    let trouve = vetements.filter(function(v) { return v.id === id; });
    if (trouve.length === 0) {
        return "?";
    }
    return "<span class='piece' data-id='" + trouve[0].id + "'>" + trouve[0].nom + "</span>";
}

async function chargerVetements() {
    let reponse = await db.from("vetements").select("*").order("nom");

    if (reponse.error) {
        console.log("Erreur de chargement :", reponse.error.message);
        alert("Impossible de charger les vêtements.");
        return;
    }

    vetements = reponse.data.map(function(v) {
        return {
            id: v.id,
            nom: v.nom,
            categorie: v.categorie,
            sousCategorie: v.sous_categorie,
            couleur: v.couleur || [],
            teinte: v.teinte,
            nuance: v.nuance,
            matiere: v.matiere,
            marque: v.marque
        };
    });
}

async function demarrer() {
    await chargerVetements();
    await chargerTenues();
    afficher(vetements);
    afficherTenues(tenues);
    remplirMenuVetements();
    construireFiltres();
    remplirListeMarques();
}

async function lancer() {
    let connecte = await verifierSession();
    if (connecte) {
        await demarrer();
    }
}

async function ajouterVetement(v) {
    let reponse = await db.from("vetements").insert({
        nom: v.nom,
        proprietaire: utilisateur.id, 
        categorie: v.categorie || null,
        sous_categorie: v.sousCategorie || null,
        couleur: v.couleur || [],
        teinte: v.teinte || null,
        nuance: v.nuance || null,
        matiere: v.matiere || null,
        marque: v.marque || null
    });
    if (reponse.error) {
        alert("Impossible d'ajouter : " + reponse.error.message);
        return false;
    }
    return true;
}

async function modifierVetement(id, v) {
    let reponse = await db.from("vetements").update({
        nom: v.nom,
        categorie: v.categorie || null,
        sous_categorie: v.sousCategorie || null,
        couleur: v.couleur || [],
        teinte: v.teinte || null,
        nuance: v.nuance || null,
        matiere: v.matiere || null,
        marque: v.marque || null
    }).eq("id", id);
    if (reponse.error) {
        alert("Impossible de modifier : " + reponse.error.message);
        return false;
    }
    return true;
}

async function supprimerVetement(id) {
    let reponse = await db.from("vetements").delete().eq("id", id);
    if (reponse.error) {
        alert("Impossible de supprimer : " + reponse.error.message);
        return false;
    }
    return true;
}

async function rafraichirVetements() {
    await chargerVetements();
    afficher(vetements);
    remplirMenuVetements();
    construireFiltres();
    remplirListeMarques();
}

async function chargerTenues() {
    let reponse = await db
        .from("tenues")
        .select("*, tenue_vetements(vetement_id)")
        .order("nom");

    if (reponse.error) {
        console.log("Erreur tenues :", reponse.error.message);
        return;
    }

    tenues = reponse.data.map(function(t) {
        return {
            id: t.id,
            nom: t.nom,
            occasion: t.occasion,
            saison: t.saison || [],
            registre: t.registre,
            eclat: t.eclat,
            vetementIds: t.tenue_vetements.map(function(lien) {
                return lien.vetement_id;
            })
        };
    });
}

async function enregistrerTenue(t, id) {
    let donnees = {
        nom: t.nom,
        proprietaire: utilisateur.id,
        occasion: t.occasion || null,
        saison: t.saison || [],
        registre: t.registre || null,
        eclat: t.eclat || null
    };

    let idTenue = id;

    if (id === null) {
        let creation = await db.from("tenues").insert(donnees).select();
        if (creation.error) {
            alert("Impossible de créer : " + creation.error.message);
            return false;
        }
        idTenue = creation.data[0].id;
    } else {
        let maj = await db.from("tenues").update(donnees).eq("id", id);
        if (maj.error) {
            alert("Impossible de modifier : " + maj.error.message);
            return false;
        }
        await db.from("tenue_vetements").delete().eq("tenue_id", id);
    }

    let paires = t.vetementIds.map(function(vid) {
        return { tenue_id: idTenue, vetement_id: vid };
    });

    if (paires.length > 0) {
        let liaison = await db.from("tenue_vetements").insert(paires);
        if (liaison.error) {
            alert("Erreur sur la composition : " + liaison.error.message);
            return false;
        }
    }

    return true;
}

async function supprimerTenue(id) {
    let reponse = await db.from("tenues").delete().eq("id", id);
    if (reponse.error) {
        alert("Impossible de supprimer : " + reponse.error.message);
        return false;
    }
    return true;
}

async function rafraichirTenues() {
    await chargerTenues();
    afficherTenues(tenues);
}

let ecranConnexion = document.getElementById("ecran-connexion");
let champEmail = document.getElementById("champ-email");
let champMotDePasse = document.getElementById("champ-motdepasse");
let btnConnexion = document.getElementById("btn-connexion");

let modeConnexion = document.getElementById("mode-connexion");
let modeInscription = document.getElementById("mode-inscription");
let zonePastilles = document.getElementById("zone-pastilles");
let nomsCouleurs = document.getElementById("noms-couleurs");
let zoneRessaisie = document.getElementById("zone-ressaisie");
let champRessaisie = document.getElementById("champ-ressaisie");
let champEmailInscription = document.getElementById("champ-email-inscription");

let motDePasseTire = "";

function tirerMotDePasse() {
    let choisies = [];
    while (choisies.length < 3) {
        let tirage = nuancier[Math.floor(Math.random() * nuancier.length)];
        let dejaLa = choisies.filter(function(c) { return c.nom === tirage.nom; });
        if (dejaLa.length === 0) {
            choisies.push(tirage);
        }
    }

    let nombre = Math.floor(Math.random() * 90) + 10;
    motDePasseTire = choisies.map(function(c) { return c.nom; }).join("-") + "-" + nombre;

    zonePastilles.innerHTML = "";
    for (let i = 0; i < choisies.length; i++) {
        zonePastilles.innerHTML = zonePastilles.innerHTML +
            "<div class='pastille' style='background:" + choisies[i].hsl + "'></div>";
    }

    for (let i = 0; i < choisies.length; i++) {
        document.documentElement.style.setProperty("--c" + (i + 1), choisies[i].hsl);
    }
       document.documentElement.style.setProperty("--c1", choisies[0].hsl);
    document.documentElement.style.setProperty("--c2", choisies[1].hsl);
    document.documentElement.style.setProperty("--c3", choisies[2].hsl);
    document.documentElement.style.setProperty("--c4", choisies[0].hsl);
    document.documentElement.style.setProperty("--c5", choisies[1].hsl);

    nomsCouleurs.innerHTML = motDePasseTire;
    zoneRessaisie.style.display = "none";
    champRessaisie.value = "";
}

document.getElementById("btn-vers-inscription").addEventListener("click", function() {
    modeConnexion.style.display = "none";
    modeInscription.style.display = "block";
    messageConnexion.innerHTML = "";
    tirerMotDePasse();
});

document.getElementById("btn-vers-connexion").addEventListener("click", function() {
    modeInscription.style.display = "none";
    modeConnexion.style.display = "block";
    messageConnexion.innerHTML = "";
    fondNeutre();
});

document.getElementById("btn-relancer").addEventListener("click", tirerMotDePasse);

document.getElementById("btn-valider-couleurs").addEventListener("click", function() {
    nomsCouleurs.innerHTML = "";
    zoneRessaisie.style.display = "block";
    champRessaisie.focus();
});

document.getElementById("btn-confirmer").addEventListener("click", async function() {
    if (champRessaisie.value.trim() !== motDePasseTire) {
        messageConnexion.innerHTML = "Ce n'est pas la bonne combinaison.";
        nomsCouleurs.innerHTML = motDePasseTire;
        return;
    }

    messageConnexion.innerHTML = "Création...";
    let reponse = await db.auth.signUp({
        email: champEmailInscription.value,
        password: motDePasseTire
    });

    if (reponse.error) {
        messageConnexion.innerHTML = "Échec : " + reponse.error.message;
        return;
    }

    messageConnexion.innerHTML = "Compte créé. Confirmez le mail reçu, puis connectez-vous.";
    modeInscription.style.display = "none";
    modeConnexion.style.display = "block";
});

let messageConnexion = document.getElementById("message-connexion");
let btnDeconnexion = document.getElementById("btn-deconnexion");

let utilisateur = null;

btnConnexion.addEventListener("click", async function() {
    messageConnexion.innerHTML = "Connexion...";
    let reponse = await db.auth.signInWithPassword({
        email: champEmail.value,
        password: champMotDePasse.value
    });

    if (reponse.error) {
        messageConnexion.innerHTML = "Échec : " + reponse.error.message;
        return;
    }

    utilisateur = reponse.data.user;
    ecranConnexion.classList.remove("visible");
    document.getElementById("app").style.display = "flex";
    fondNeutre();
    intro.style.display = "flex";
    lancerIntro();
    await demarrer();
});

btnDeconnexion.addEventListener("click", async function() {
    await db.auth.signOut();
    utilisateur = null;
    location.reload();
});

async function verifierSession() {
    let reponse = await db.auth.getSession();
    if (reponse.data.session) {
        utilisateur = reponse.data.session.user;
        lancerIntro();
        return true;
    }
    intro.style.display = "none";
    document.getElementById("app").style.display = "none";
    ecranConnexion.classList.add("visible");
    return false;
}

function cleMarque(texte) {
    return (texte || "")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function marquesConnues() {
    let parCle = {};
    for (let i = 0; i < vetements.length; i++) {
        let m = vetements[i].marque;
        if (!m) { continue; }
        let cle = cleMarque(m);
        if (!parCle[cle]) { parCle[cle] = m; }
    }
    return parCle;
}

function remplirListeMarques() {
    let laListe = document.getElementById("liste-marques");
    let noms = Object.values(marquesConnues()).sort();
    laListe.innerHTML = "";
    for (let i = 0; i < noms.length; i++) {
        laListe.innerHTML = laListe.innerHTML + "<option value=\"" + noms[i] + "\">";
    }
}

function marqueUniformisee(texte) {
    let propre = (texte || "").trim();
    if (propre === "") { return ""; }
    let cle = cleMarque(propre);
    let parCle = marquesConnues();
    return parCle[cle] ? parCle[cle] : propre;
}

let exceptionsFamille = {
    // "nom-de-couleur": "Famille",
};

function familleDe(c) {
    if (exceptionsFamille[c.nom]) {
        return exceptionsFamille[c.nom];
    }

    let p = c.hsl.replace("hsl(", "").replace(")", "").split(",");
    let h = Number(p[0]);
    let s = Number(p[1].replace("%", ""));
    let l = Number(p[2].replace("%", ""));
    let metaux = ["bronze", "cuivre", "or", "argent", "etain", "laiton", "acier", "nickel", "platine", "patine", "plomb", "zinc", "fonte", "vermeil", "chrome", "rouille-metal"];

    if (metaux.indexOf(c.nom) !== -1) { return "Métallique"; }
    if (l <= 18) { return "Noir"; }
    if (s <= 12) { return l >= 85 ? "Blanc" : "Gris"; }
    if (l >= 86 && s <= 30) { return "Blanc"; }
    if (h >= 20 && h <= 50 && l >= 62) { return "Beige"; }
    if (h >= 45 && h <= 110 && s <= 30 && l < 45) { return "Brun"; }
    if (h >= 10 && h <= 45 && l < 50) { return "Brun"; }
    if (h < 15 || h >= 345) { return l >= 70 ? "Rose" : "Rouge"; }
    if (h < 45) { return "Orange"; }
    if (h < 65) { return "Jaune"; }
    if (h < 170) { return "Vert"; }
    if (h < 250) { return "Bleu"; }
    if (h < 320) { return "Violet"; }
    return "Rose";
}

let teinteChoisie = "";

function afficherNuances(famille) {
    let zone = document.getElementById("zone-nuances");
    let dedans = nuancier.filter(function(c) {
        return familleDe(c) === famille;
    });

    let texte = "";
    for (let i = 0; i < dedans.length; i++) {
        let classe = dedans[i].nom === teinteChoisie ? "nuance choisie" : "nuance";
        texte = texte + "<button type='button' class='" + classe + "' data-nom='" + dedans[i].nom +
            "' title='" + dedans[i].nom + "' style='background:" + dedans[i].hsl + "'></button>";
    }
    if (teinteChoisie) {
        texte = texte + "<span id='nom-nuance'>" + teinteChoisie + "</span>";
    }
    zone.innerHTML = texte;

    let boutons = zone.querySelectorAll(".nuance");
    for (let i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener("click", function() {
            teinteChoisie = this.dataset.nom;
            afficherNuances(famille);
        });
    }
}

champCouleur.addEventListener("input", function() {
    teinteChoisie = "";
    afficherNuances(champCouleur.value);
});

let silhouetteMannequin = "M88 58 L112 58 L112 72 L140 80 L165 150 L150 156 L135 118 L135 200 L140 360 L106 360 L100 250 L94 360 L60 360 L65 200 L65 118 L50 156 L35 150 L60 80 L88 72 Z";

let formesPieces = {
    "Haut": "M60 80 L140 80 L165 150 L147 157 L135 122 L135 200 L65 200 L65 122 L53 157 L35 150 Z",
    "Bas": "M65 198 L135 198 L140 360 L108 360 L100 252 L92 360 L60 360 Z",
    "Pièce entière": "M62 80 L138 80 L140 200 L158 330 L42 330 L60 200 Z",
    "Chaussure": "M58 360 L94 360 L98 380 L50 380 Z M106 360 L142 360 L150 380 L102 380 Z",
    "Accessoire": "M80 70 Q100 92 120 70 L123 83 Q100 106 77 83 Z"
};

function couleurApercu() {
    if (teinteChoisie) {
        let c = nuancier.find(function(x) { return x.nom === teinteChoisie; });
        if (c) { return c.hsl; }
    }
    if (champCouleur.value) {
        let dedans = nuancier.filter(function(x) { return familleDe(x) === champCouleur.value; });
        if (dedans.length > 0) { return dedans[Math.floor(dedans.length / 2)].hsl; }
    }
    return "rgba(0, 0, 0, 0.06)";
}

function dessinerApercu() {
    let svg = "<svg viewBox='0 0 200 400'>" +
        "<circle cx='100' cy='38' r='18' class='mannequin'/>" +
        "<path d='" + silhouetteMannequin + "' class='mannequin'/>";

    let forme = formesPieces[champCategorie.value];
    if (forme) {
        svg = svg + "<path d='" + forme + "' fill='" + couleurApercu() + "' class='piece-apercu'/>";
    }
    svg = svg + "</svg>";

    if (champNom.value) {
        svg = svg + "<p class='apercu-nom'>" + champNom.value + "</p>";
    }

    document.getElementById("apercu").innerHTML = svg;
}

champNom.addEventListener("input", dessinerApercu);

function couleurDeVetement(v) {
    if (v.teinte) {
        let c = nuancier.find(function(x) { return x.nom === v.teinte; });
        if (c) { return c.hsl; }
    }
    if (v.couleur && v.couleur[0]) {
        let dedans = nuancier.filter(function(x) { return familleDe(x) === v.couleur[0]; });
        if (dedans.length > 0) { return dedans[Math.floor(dedans.length / 2)].hsl; }
    }
    return null;
}

function pastillesTenue(tenue) {
    let texte = "<span class='pastilles-tenue'>";
    for (let i = 0; i < tenue.vetementIds.length; i++) {
        let v = vetements.find(function(x) { return x.id === tenue.vetementIds[i]; });
        if (!v) { continue; }
        let couleur = couleurDeVetement(v);
        if (!couleur) { continue; }
        texte = texte + "<span class='pastille-tenue' title=\"" + v.nom + "\" style='background:" + couleur + "'></span>";
    }
    return texte + "</span>";
}

let nuancier = [
    { nom: "vert-de-gris", hsl: "hsl(150, 18%, 42%)" },
    { nom: "tabac", hsl: "hsl(30, 35%, 32%)" },
    { nom: "olive", hsl: "hsl(70, 25%, 33%)" },
    { nom: "mousse", hsl: "hsl(100, 22%, 30%)" },
    { nom: "sienne", hsl: "hsl(20, 45%, 38%)" },
    { nom: "rouille", hsl: "hsl(18, 55%, 40%)" },
    { nom: "lie-de-vin", hsl: "hsl(345, 40%, 28%)" },
    { nom: "prune", hsl: "hsl(300, 25%, 30%)" },
    { nom: "ardoise", hsl: "hsl(210, 15%, 38%)" },
    { nom: "cendre", hsl: "hsl(40, 8%, 55%)" },
    { nom: "zinzolin", hsl: "hsl(290, 45%, 35%)" },
    { nom: "gorge-de-pigeon", hsl: "hsl(315, 22%, 58%)" },
    { nom: "ventre-de-biche", hsl: "hsl(35, 28%, 72%)" },
    { nom: "queue-de-renard", hsl: "hsl(25, 60%, 42%)" },
    { nom: "caca-d-oie", hsl: "hsl(60, 45%, 38%)" },
    { nom: "cuisse-de-nymphe", hsl: "hsl(355, 45%, 85%)" },
    { nom: "sang-de-boeuf", hsl: "hsl(0, 55%, 28%)" },
    { nom: "feuille-morte", hsl: "hsl(30, 40%, 38%)" },
    { nom: "terre-de-sienne", hsl: "hsl(18, 48%, 35%)" },
    { nom: "terre-d-ombre", hsl: "hsl(28, 35%, 25%)" },
    { nom: "celadon", hsl: "hsl(150, 30%, 78%)" },
    { nom: "poudre", hsl: "hsl(350, 35%, 85%)" },
    { nom: "opaline", hsl: "hsl(180, 25%, 88%)" },
    { nom: "lilas", hsl: "hsl(280, 35%, 82%)" },
    { nom: "amande", hsl: "hsl(75, 30%, 80%)" },
    { nom: "dragee", hsl: "hsl(20, 45%, 87%)" },
    { nom: "ecru", hsl: "hsl(45, 30%, 88%)" },
    { nom: "glycine", hsl: "hsl(265, 30%, 80%)" },
    { nom: "brume", hsl: "hsl(200, 20%, 85%)" },
    { nom: "coquille", hsl: "hsl(25, 35%, 90%)" },
    { nom: "ivoire", hsl: "hsl(48, 35%, 90%)" },
    { nom: "nacre", hsl: "hsl(35, 22%, 87%)" },
    { nom: "albatre", hsl: "hsl(45, 18%, 92%)" },
    { nom: "lin", hsl: "hsl(40, 25%, 84%)" },
    { nom: "grege", hsl: "hsl(35, 15%, 76%)" },
    { nom: "mastic", hsl: "hsl(45, 20%, 70%)" },
    { nom: "chair", hsl: "hsl(20, 45%, 82%)" },
    { nom: "pervenche", hsl: "hsl(225, 45%, 78%)" },
    { nom: "azurin", hsl: "hsl(200, 40%, 82%)" },
    { nom: "givre", hsl: "hsl(190, 22%, 88%)" },
    { nom: "vermillon", hsl: "hsl(5, 85%, 52%)" },
    { nom: "cobalt", hsl: "hsl(220, 80%, 48%)" },
    { nom: "emeraude", hsl: "hsl(150, 75%, 40%)" },
    { nom: "safran", hsl: "hsl(40, 90%, 55%)" },
    { nom: "magenta", hsl: "hsl(320, 80%, 50%)" },
    { nom: "turquoise", hsl: "hsl(175, 70%, 45%)" },
    { nom: "ecarlate", hsl: "hsl(350, 85%, 48%)" },
    { nom: "chartreuse", hsl: "hsl(85, 80%, 50%)" },
    { nom: "cyan", hsl: "hsl(190, 85%, 48%)" },
    { nom: "fuchsia", hsl: "hsl(305, 75%, 55%)" },
    { nom: "garance", hsl: "hsl(358, 70%, 45%)" },
    { nom: "cinabre", hsl: "hsl(8, 80%, 48%)" },
    { nom: "outremer", hsl: "hsl(232, 75%, 45%)" },
    { nom: "carmin", hsl: "hsl(348, 78%, 42%)" },
    { nom: "amarante", hsl: "hsl(338, 65%, 48%)" },
    { nom: "cramoisi", hsl: "hsl(345, 75%, 38%)" },
    { nom: "indigo", hsl: "hsl(255, 60%, 40%)" },
    { nom: "sarcelle", hsl: "hsl(182, 65%, 35%)" },
    { nom: "orpiment", hsl: "hsl(45, 92%, 52%)" },
    { nom: "gaude", hsl: "hsl(55, 75%, 48%)" },
    { nom: "neon", hsl: "hsl(120, 100%, 60%)" },
    { nom: "acidule", hsl: "hsl(65, 100%, 58%)" },
    { nom: "fluo", hsl: "hsl(330, 100%, 62%)" },
    { nom: "chrome", hsl: "hsl(200, 15%, 75%)" },
    { nom: "phosphore", hsl: "hsl(160, 100%, 55%)" },
    { nom: "laque", hsl: "hsl(355, 95%, 45%)" },
    { nom: "pixel", hsl: "hsl(240, 100%, 60%)" },
    { nom: "halogene", hsl: "hsl(50, 95%, 68%)" },
    { nom: "synthetique", hsl: "hsl(285, 90%, 58%)" },
    { nom: "signal", hsl: "hsl(25, 100%, 55%)" },
    { nom: "electrique", hsl: "hsl(210, 100%, 55%)" },
    { nom: "radium", hsl: "hsl(140, 95%, 52%)" },
    { nom: "sodium", hsl: "hsl(35, 100%, 60%)" },
    { nom: "argon", hsl: "hsl(265, 95%, 62%)" },
    { nom: "krypton", hsl: "hsl(180, 95%, 58%)" },
    { nom: "tungstene", hsl: "hsl(42, 85%, 62%)" },
    { nom: "cathode", hsl: "hsl(300, 90%, 55%)" },
    { nom: "spectre", hsl: "hsl(95, 95%, 55%)" },
    { nom: "vinyle", hsl: "hsl(350, 88%, 58%)" },
    { nom: "resine", hsl: "hsl(30, 85%, 60%)" },
    { nom: "chataigne", hsl: "hsl(20, 40%, 30%)" },
    { nom: "bruyere", hsl: "hsl(320, 20%, 45%)" },
    { nom: "terracotta", hsl: "hsl(15, 50%, 48%)" },
    { nom: "ambre", hsl: "hsl(38, 60%, 48%)" },
    { nom: "bistre", hsl: "hsl(35, 30%, 28%)" },
    { nom: "noisette", hsl: "hsl(28, 35%, 45%)" },
    { nom: "bordeaux", hsl: "hsl(348, 50%, 26%)" },
    { nom: "gland", hsl: "hsl(35, 38%, 35%)" },
    { nom: "paille", hsl: "hsl(48, 45%, 62%)" },
    { nom: "brou-de-noix", hsl: "hsl(25, 42%, 25%)" },
    { nom: "havane", hsl: "hsl(28, 40%, 38%)" },
    { nom: "chamois", hsl: "hsl(38, 42%, 58%)" },
    { nom: "fauve", hsl: "hsl(28, 48%, 45%)" },
    { nom: "moutarde", hsl: "hsl(45, 62%, 45%)" },
    { nom: "curry", hsl: "hsl(40, 58%, 48%)" },
    { nom: "citrouille", hsl: "hsl(28, 65%, 52%)" },
    { nom: "chaudron", hsl: "hsl(22, 50%, 38%)" },
    { nom: "grenat", hsl: "hsl(350, 55%, 32%)" },
    { nom: "acajou", hsl: "hsl(12, 45%, 32%)" },
    { nom: "marron", hsl: "hsl(25, 42%, 32%)" },
    { nom: "granit", hsl: "hsl(220, 8%, 42%)" },
    { nom: "basalte", hsl: "hsl(210, 10%, 25%)" },
    { nom: "schiste", hsl: "hsl(200, 12%, 35%)" },
    { nom: "calcaire", hsl: "hsl(45, 15%, 72%)" },
    { nom: "obsidienne", hsl: "hsl(250, 12%, 15%)" },
    { nom: "marbre", hsl: "hsl(30, 12%, 82%)" },
    { nom: "silex", hsl: "hsl(215, 10%, 48%)" },
    { nom: "argile", hsl: "hsl(25, 25%, 55%)" },
    { nom: "quartz", hsl: "hsl(340, 15%, 78%)" },
    { nom: "craie", hsl: "hsl(50, 18%, 90%)" },
    { nom: "gres", hsl: "hsl(30, 22%, 62%)" },
    { nom: "galet", hsl: "hsl(210, 8%, 58%)" },
    { nom: "mica", hsl: "hsl(45, 12%, 68%)" },
    { nom: "jaspe", hsl: "hsl(10, 35%, 42%)" },
    { nom: "malachite", hsl: "hsl(155, 45%, 35%)" },
    { nom: "lapis", hsl: "hsl(225, 55%, 38%)" },
    { nom: "onyx", hsl: "hsl(260, 10%, 10%)" },
    { nom: "agate", hsl: "hsl(25, 18%, 55%)" },
    { nom: "opale", hsl: "hsl(190, 20%, 80%)" },
    { nom: "jade", hsl: "hsl(155, 32%, 52%)" },
    { nom: "bronze", hsl: "hsl(30, 45%, 40%)" },
    { nom: "cuivre", hsl: "hsl(22, 55%, 45%)" },
    { nom: "or", hsl: "hsl(45, 65%, 52%)" },
    { nom: "argent", hsl: "hsl(210, 8%, 72%)" },
    { nom: "etain", hsl: "hsl(215, 6%, 62%)" },
    { nom: "laiton", hsl: "hsl(48, 50%, 48%)" },
    { nom: "acier", hsl: "hsl(210, 12%, 55%)" },
    { nom: "nickel", hsl: "hsl(200, 5%, 65%)" },
    { nom: "platine", hsl: "hsl(45, 10%, 80%)" },
    { nom: "patine", hsl: "hsl(165, 25%, 55%)" },
    { nom: "plomb", hsl: "hsl(215, 8%, 40%)" },
    { nom: "zinc", hsl: "hsl(205, 7%, 58%)" },
    { nom: "fonte", hsl: "hsl(210, 6%, 30%)" },
    { nom: "rouille-metal", hsl: "hsl(15, 48%, 38%)" },
    { nom: "vermeil", hsl: "hsl(42, 58%, 55%)" },
    { nom: "encre", hsl: "hsl(225, 40%, 18%)" },
    { nom: "nocturne", hsl: "hsl(240, 30%, 22%)" },
    { nom: "suie", hsl: "hsl(20, 8%, 16%)" },
    { nom: "abysse", hsl: "hsl(200, 45%, 20%)" },
    { nom: "corbeau", hsl: "hsl(280, 15%, 14%)" },
    { nom: "cave", hsl: "hsl(100, 12%, 20%)" },
    { nom: "goudron", hsl: "hsl(210, 6%, 12%)" },
    { nom: "minuit", hsl: "hsl(230, 50%, 16%)" },
    { nom: "tourbe", hsl: "hsl(30, 20%, 18%)" },
    { nom: "charbon", hsl: "hsl(0, 0%, 14%)" },
    { nom: "anthracite", hsl: "hsl(210, 10%, 22%)" },
    { nom: "reglisse", hsl: "hsl(30, 15%, 12%)" },
    { nom: "ebene", hsl: "hsl(25, 12%, 15%)" },
    { nom: "cassis", hsl: "hsl(320, 45%, 22%)" },
    { nom: "aubergine", hsl: "hsl(285, 35%, 20%)" },
    { nom: "caroube", hsl: "hsl(20, 30%, 20%)" },
    { nom: "vetiver", hsl: "hsl(85, 18%, 32%)" },
    { nom: "sauge", hsl: "hsl(95, 20%, 55%)" },
    { nom: "eucalyptus", hsl: "hsl(140, 18%, 48%)" },
    { nom: "absinthe", hsl: "hsl(75, 40%, 48%)" },
    { nom: "pistache", hsl: "hsl(85, 38%, 62%)" },
    { nom: "menthe", hsl: "hsl(155, 40%, 68%)" },
    { nom: "tilleul", hsl: "hsl(75, 35%, 68%)" },
    { nom: "lichen", hsl: "hsl(70, 22%, 45%)" },
    { nom: "fougere", hsl: "hsl(110, 28%, 38%)" },
    { nom: "cresson", hsl: "hsl(100, 32%, 42%)" },
    { nom: "epinard", hsl: "hsl(120, 25%, 28%)" },
    { nom: "sapin", hsl: "hsl(150, 35%, 22%)" },
    { nom: "cedre", hsl: "hsl(130, 20%, 32%)" },
    { nom: "khaki", hsl: "hsl(55, 22%, 42%)" },
    { nom: "bitume", hsl: "hsl(40, 12%, 30%)" },
    { nom: "safre", hsl: "hsl(215, 50%, 42%)" },
    { nom: "guede", hsl: "hsl(228, 42%, 35%)" },
    { nom: "pastel", hsl: "hsl(222, 38%, 48%)" },
    { nom: "canard", hsl: "hsl(190, 45%, 30%)" },
    { nom: "petrole", hsl: "hsl(195, 40%, 25%)" },
    { nom: "prusse", hsl: "hsl(205, 60%, 25%)" },
    { nom: "orage", hsl: "hsl(215, 22%, 42%)" },
    { nom: "denim", hsl: "hsl(215, 35%, 45%)" },
    { nom: "delave", hsl: "hsl(210, 25%, 62%)" },
    { nom: "horizon", hsl: "hsl(200, 30%, 68%)" },
    { nom: "lavande", hsl: "hsl(255, 32%, 65%)" },
    { nom: "violine", hsl: "hsl(290, 40%, 42%)" },
    { nom: "mauve", hsl: "hsl(285, 28%, 58%)" },
    { nom: "parme", hsl: "hsl(275, 25%, 70%)" },
    { nom: "orchidee", hsl: "hsl(300, 38%, 62%)" },
    { nom: "byzantin", hsl: "hsl(318, 48%, 38%)" },
    { nom: "eveque", hsl: "hsl(295, 32%, 32%)" },
    { nom: "framboise", hsl: "hsl(338, 58%, 48%)" },
    { nom: "grenadine", hsl: "hsl(345, 62%, 52%)" },
    { nom: "corail", hsl: "hsl(12, 68%, 62%)" },
    { nom: "saumon", hsl: "hsl(15, 55%, 70%)" },
    { nom: "abricot", hsl: "hsl(28, 62%, 68%)" },
    { nom: "peche", hsl: "hsl(22, 58%, 78%)" },
    { nom: "brique", hsl: "hsl(10, 42%, 45%)" },
    { nom: "tuile", hsl: "hsl(15, 48%, 52%)" },
    { nom: "capucine", hsl: "hsl(25, 72%, 55%)" },
    { nom: "souci", hsl: "hsl(35, 78%, 55%)" },
    { nom: "miel", hsl: "hsl(40, 58%, 58%)" },
    { nom: "cire", hsl: "hsl(45, 42%, 68%)" },
    { nom: "sable", hsl: "hsl(42, 32%, 72%)" },
    { nom: "dune", hsl: "hsl(38, 28%, 68%)" },
    { nom: "taupe", hsl: "hsl(30, 12%, 48%)" },
    { nom: "bitter", hsl: "hsl(18, 62%, 48%)" }
];

dessinerApercu();
lancer();
