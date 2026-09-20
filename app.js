const SUPABASE_URL = "https://jragildtoksjhnwbktuf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYWdpbGR0b2tzamhud2JrdHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3ODQ1NjgsImV4cCI6MjEwNTM2MDU2OH0._QdwF5gvPPSqeE4Prfg1fTNZ-hLxP4pf8pf6ae-8kXU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let teinte = Math.floor(Math.random() * 360);

function couleursDeLaTeinte(t) {
    return [
    "hsl(" + (t - 40) + ", 16%, 91%)",
    "hsl(" + (t - 20) + ", 26%, 64%)",
    "hsl(" + t + ", 38%, 40%)",
    "hsl(" + (t + 20) + ", 45%, 30%)",
    "hsl(" + (t + 40) + ", 40%, 22%)"
];
}

function appliquerTeinte() {
    let couleurs = couleursDeLaTeinte(teinte);
    for (let i = 0; i < couleurs.length; i++) {
        document.documentElement.style.setProperty("--c" + (i + 1), couleurs[i]);
    }
    document.documentElement.style.setProperty("--couleur-session", couleurs[0]);
}

appliquerTeinte();

let derive = setInterval(function() {
    teinte = teinte + 0.05;
    appliquerTeinte();
}, 200);

let vetements = [];
let idEnModification = null;
let idTenueEnModification = null;

let sousCategories = {
    "Haut": ["Chemise", "Pull", "Polo", "T-shirt", "Veste", "Manteau", "K-way", "Maillot de sport"],
    "Pantalon": ["Pantalon long", "Pantalon court", "Bermuda", "Salopette", "Combinaison"],
    "Chaussure": ["Basket", "Soulier"],
    "Accessoire": ["Ceinture", "Cravate", "Nœud papillon", "Écharpe", "Foulard"]
};

function remplirSousCategories(categorie) {
    champSousCategorie.innerHTML = "<option value=''>—</option>";
    if (sousCategories[categorie] !== undefined) {
        let liste = sousCategories[categorie];
        for (let i = 0; i < liste.length; i++) {
            champSousCategorie.innerHTML = champSousCategorie.innerHTML + "<option value='" + liste[i] + "'>" + liste[i] + "</option>";
        }
    }
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
let champImporter = document.getElementById("champ-importer");

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
        couleur: Array.from(champCouleur.selectedOptions).map(function(o) {
            return o.value;
        }),
        nuance: champNuance.value,
        matiere: champMatiere.value,
        marque: champMarque.value
    };

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

    for (let j = 0; j < champCouleur.options.length; j++) {
        champCouleur.options[j].selected = false;
    }
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

            for (let j = 0; j < champCouleur.options.length; j++) {
                if (v.couleur.indexOf(champCouleur.options[j].value) === -1) {
                    champCouleur.options[j].selected = false;
                } else {
                    champCouleur.options[j].selected = true;
                }
            }

            idEnModification = id;
            btnAjouter.innerHTML = "Enregistrer";
            btnAnnuler.style.display = "inline-block";
        });
    }
}
    

function activerSuppressionTenues() {
    let boutons = document.querySelectorAll(".btn-supprimer-tenue");
    for (let i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener("click", function() {
            let id = Number(this.getAttribute("data-id"));
            tenues = tenues.filter(function(t) {
                return t.id !== id;
            });
            sauvegarderTenues(tenues);
            afficherTenues(tenues);
        });
    }
}

let tenues = [];



let sauvegardeTenues = localStorage.getItem("tenues");
if (sauvegardeTenues !== null) {
    tenues = JSON.parse(sauvegardeTenues);
}

let prochainIdTenue = 1;
for (let i = 0; i < tenues.length; i++) {
    if (tenues[i].id >= prochainIdTenue) {
        prochainIdTenue = tenues[i].id + 1;
    }
}

function remplirMenuVetements() {
    zoneTenueVetements.innerHTML = "";
    let categories = ["Haut", "Pantalon", "Chaussure", "Accessoire"];

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


btnCreerTenue.addEventListener("click", function() {
    if (champTenueNom.value === "") {
        alert("Pour se confectionner des tenues sans nom, DONNEZ UN NOM À LA TENUE");
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

        if (idTenueEnModification !== null) {
        for (let i = 0; i < tenues.length; i++) {
            if (tenues[i].id === idTenueEnModification) {
                tenues[i].nom = champTenueNom.value;
                tenues[i].vetementIds = idsSelectionnes;
                tenues[i].occasion = champOccasion.value;
                tenues[i].saison = Array.from(champSaison.selectedOptions).map(function(o) {
                    return o.value;
                });
                tenues[i].registre = champRegistre.value;
                tenues[i].eclat = champEclat.value;
            }
        }
    }
    else {
        let nouvelleTenue = {
            id: prochainIdTenue,
            nom: champTenueNom.value,
            vetementIds: idsSelectionnes,
            occasion: champOccasion.value,
            saison: Array.from(champSaison.selectedOptions).map(function(o) {
                return o.value;
            }),
            registre: champRegistre.value,
            eclat: champEclat.value
        };
        prochainIdTenue = prochainIdTenue + 1;
        tenues.push(nouvelleTenue);
    }

    sauvegarderTenues();
    afficherTenues(tenues);
    sortirDeModificationTenue();
});

function sauvegarderTenues() {
    localStorage.setItem("tenues", JSON.stringify(tenues));
}

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
    afficherTenues(resultat);
});

btnReset.addEventListener("click", function() {
    afficherTenues(tenues);
});

function afficherTenues(items) {
    listeTenues.innerHTML = "";
    for (let i = 0; i < items.length; i++) {          
    listeTenues.innerHTML = listeTenues.innerHTML + "<li><strong>" + items[i].nom + "</strong> — " + items[i].occasion + " — " + items[i].saison.join("/") + " — " + items[i].registre + " — " + items[i].eclat + "<br>" + composerTenue(items[i]) + " <button class='btn-modifier-tenue' data-id='" + items[i].id + "'>modifier</button> <button class='btn-supprimer-tenue' data-id='" + items[i].id + "'>x</button></li>";
    }

    activerSuppressionTenues(tenues);
    activerClicPieces();
    activerModificationTenue();
}


champImporter.addEventListener("change", function() {
    let fichier = this.files[0];
    let lecteur = new FileReader();
    lecteur.onload = function() {
        let donnees = JSON.parse(lecteur.result);
        vetements = donnees.vetements;
        tenues = donnees.tenues;
        sauvegarderTenues();
        afficher(vetements);
        afficherTenues(tenues);
        remplirMenuVetements();
        construireFiltres();
        alert("Données réimportées");
    };
    lecteur.readAsText(fichier);
});

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
        });
    }
}

function sortirDeModificationTenue() {
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
}

btnAnnulerTenue.addEventListener("click", sortirDeModificationTenue);

let intro = document.getElementById("intro");
let introTitre = document.getElementById("intro-titre");
let introTexte = document.getElementById("intro-texte");

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

intro.addEventListener("click", function() {
    intro.classList.add("efface");
    document.querySelector("#barre h1").classList.add("arrive");
    setTimeout(function() {
        intro.style.display = "none";
    }, 1000);
});

let filtresInventaire = document.getElementById("filtres-inventaire");

function construireFiltres() {
    let texte = "<button class='filtre' data-type='tous'>Tous</button>";
    let categories = ["Haut", "Pantalon", "Chaussure", "Accessoire"];

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
            nuance: v.nuance,
            matiere: v.matiere,
            marque: v.marque
        };
    });
}

async function demarrer() {
    await chargerVetements();
    afficher(vetements);
    remplirMenuVetements();
    construireFiltres();
}

demarrer();

async function ajouterVetement(v) {
    let reponse = await db.from("vetements").insert({
        nom: v.nom,
        categorie: v.categorie || null,
        sous_categorie: v.sousCategorie || null,
        couleur: v.couleur || [],
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
}