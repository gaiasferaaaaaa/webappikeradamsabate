let validat = false;
let nom, contrasenya;
let scriptURL = "https://script.google.com/macros/s/AKfycbygt4C300R84kIvF3Cqi0j1gc1LKBC_sfDCF0Xu80SmTmMg6xN9pwELEXatqaWmj91T/exec"; // Sustituir por la URL del script correcto

function canvia_seccio(num_boto) {
    const menu = document.getElementById("menu");
    const num_botons = menu.children.length;
    for (let i = 1; i < num_botons; i++) {
        let boto = document.getElementById("boto_" + i);
        let seccio = document.getElementById("seccio_" + i);
        if (i == num_boto) {
            boto.style.color = "#950E17";
            boto.style.backgroundColor = "#FCDEE0";
            seccio.style.display = "flex";
        } else {
            boto.style.color = "white";
            boto.style.backgroundColor = "#950E17";
            seccio.style.display = "none";
        }
    }
}

function inici_sessio() {
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    console.log("Iniciando sesión con:", nom, contrasenya);
    let consulta = `${scriptURL}?query=select&where=usuari&is=${nom}&and=contrasenya&equal=${contrasenya}`;
    console.log("Consulta URL:", consulta);
    fetch(consulta)
        .then((resposta) => {
            console.log("Respuesta del servidor:", resposta);
            return resposta.json();
        })
        .then((resposta) => {
            console.log("Datos recibidos:", resposta);
            if (resposta.length === 0) {
                window.alert("El nom d'usuari o la contrasenya no són correctes.");
            } else {
                window.alert("S'ha iniciat correctament la sessió.");
                inicia_sessio();
            }
        })
        .catch((error) => {
            console.error("Error en la solicitud:", error);
        });
}

function inicia_sessio() {
    validat = true;
    document.getElementById("seccio_0").style.display = "none";
    canvia_seccio(1);
}

function nou_usuari() {
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta_1 = `${scriptURL}?query=select&where=usuari&is=${nom}`;
    console.log("Consulta para nuevo usuario:", consulta_1);
    fetch(consulta_1)
        .then((resposta) => resposta.json())
        .then((resposta) => {
            console.log("Datos recibidos para nuevo usuario:", resposta);
            if (resposta.length === 0) {
                let consulta_2 = `${scriptURL}?query=insert&values=${nom}$$${contrasenya}`;
                console.log("Consulta de inserción:", consulta_2);
                fetch(consulta_2)
                    .then((resposta) => {
                        if (resposta.ok) {
                            window.alert("S'ha completat el registre d'usuari.");
                            inicia_sessio();
                        } else {
                            alert("S'ha produït un error en el registre d'usuari.");
                        }
                    })
                    .catch((error) => {
                        console.error("Error en la inserción de usuario:", error);
                    });
            } else {
                alert("Ja existeix un usuari amb aquest nom.");
            }
        })
        .catch((error) => {
            console.error("Error en la verificación de usuario:", error);
        });
}

function tanca_sessio() {
    if (validat) {
        if (confirm("Vols tancar la sessió?")) {
            location.reload();
        }
    }
}

window.onload = () => {
    if (!localStorage.getItem("base_de_dades")) {
        indexedDB.open("Dades").onupgradeneeded = event => {
            event.target.result.createObjectStore("Fotos", { keyPath: "ID", autoIncrement: true }).createIndex("Usuari_index", "Usuari");
        };
        localStorage.setItem("base_de_dades", "ok");
    }
    document.getElementById("obturador").addEventListener("change", function () {
        if (this.files[0] !== undefined) {
            let canvas = document.getElementById("canvas");
            let context = canvas.getContext("2d");
            let imatge = new Image();
            imatge.src = URL.createObjectURL(this.files[0]);
            imatge.onload = () => {
                canvas.width = imatge.width;
                canvas.height = imatge.height;
                context.drawImage(imatge, 0, 0, imatge.width, imatge.height);
                document.getElementById("foto").src = canvas.toDataURL("image/jpeg");
                document.getElementById("icona_camera").style.display = "none";
                document.getElementById("desa").style.display = "unset";
            };
        }
    });
}

function desa_foto() {
    let nou_registre = {
        Usuari: nom,
        Data: new Date().toLocaleDateString() + " - " + new Date().toLocaleTimeString(),
        Foto: document.getElementById("foto").src
    };
    indexedDB.open("Dades").onsuccess = event => {
        event.target.result.transaction("Fotos", "readwrite").objectStore("Fotos").add(nou_registre).onsuccess = () => {
            document.getElementById("desa").style.display = "none";
            alert("La foto s'ha desat correctament.");
        };
    };
}
window.onload = () => { 
    let base_de_dades = storage.getItem("base_de_dades");   
    if(base_de_dades == null) {
        indexedDB.open("Dades").onupgradeneeded = event => {   
            event.target.result.createObjectStore("Fotos", {keyPath: "ID", autoIncrement:true}).createIndex("Usuari_index", "Usuari");
        }    // les fotos es desen a la taula "Fotos"
        storage.setItem("base_de_dades","ok");
    }
    document.getElementById("obturador").addEventListener("change", function() {    // procediment que s'executa quan s'obté el fitxer de la foto realitzada (esdeveniment "change")
        if(this.files[0] != undefined) {    // instruccions que s'executen només si s'obté algun fitxer (només es processa el primer que es rebi)
            let canvas = document.getElementById("canvas");    // contenidor on es desa temporalment la imatge
            let context = canvas.getContext("2d");
            let imatge = new Image;
            imatge.src = URL.createObjectURL(this.files[0]);    // es crea la imatge a partir del fitxer
            imatge.onload = () => {    // procediment que s'executa un cop la imatge s'ha carregat en el contenidor
                canvas.width = imatge.width;
                canvas.height = imatge.height;                
                context.drawImage(imatge,0,0,imatge.width,imatge.height);    // es "dibuixa" la imatge en el canvas
                document.getElementById("foto").src = canvas.toDataURL("image/jpeg");    // la imatge es mostra en format jpg
                document.getElementById("icona_camera").style.display = "none";    // s'oculta la icona que hi havia abans de fer la foto
                document.getElementById("desa").style.display = "unset";    // es mostra el botó per desar la foto
            }
        }
    });
}
function desa_foto() {
    let nou_registre = {    // contingut del nou registre de la base de dades
        Usuari: usuari,    // nom d'usuari
        Data: new Date().toLocaleDateString() + " - " + new Date().toLocaleTimeString(),    // data i hora actuals
        Foto: document.getElementById("foto").src    // foto
    };
    indexedDB.open("Dades").onsuccess = event => {   
        event.target.result.transaction("Fotos", "readwrite").objectStore("Fotos").add(nou_registre).onsuccess = () => {
            document.getElementById("desa").style.display = "none";
            alert("La foto s'ha desat correctament.");    
        };
    };
}
function mostra_foto(id) {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let imatge = new Image;
    if (id == 0) {    // darrera foto realitzada, potser sense desar
        seccio_origen = 2;    // origen en la seccció "càmera"
        document.getElementById("seccio_2").style.display = "none";    // s'oculta la secció "càmera"
        imatge.src = document.getElementById("foto").src;
    }
    else {
        seccio_origen = 3;    // origen en la seccció "galeria"
        indexedDB.open("Dades").onsuccess = event => {    // s'obté la foto de la base de dades
            event.target.result.transaction(["Fotos"], "readonly").objectStore("Fotos").get(id).onsuccess = event => {
                document.getElementById("seccio_3").style.display = "none";    // s'oculta la secció "galeria"
                imatge.src = event.target.result["Foto"];
            }
        }
    }
    imatge.onload = () => {    // esdeveniment que es produeix un cop s'ha carregat la imatge
        if (imatge.width > imatge.height) {    // imatge apaïsada
            canvas.width = imatge.height;
            canvas.height = imatge.width;
            context.translate(imatge.height, 0);
            context.rotate(Math.PI / 2);
        } else {    // imatge vertical
            canvas.width = imatge.width;
            canvas.height = imatge.height;
        }
        context.drawImage(imatge,0,0,imatge.width,imatge.height);
        document.getElementById("foto_gran").src = canvas.toDataURL("image/jpeg", 0.5);
    }
    document.getElementById("superior").classList.add("ocult");    // s'oculta provisionalment el contenidor superior
    document.getElementById("menu").style.display = "none";    // s'oculta el menú
    document.getElementById("div_gran").style.display = "flex";    // es mostra el contenidor de la foto a pantalla completa
}
function retorn_a_seccio() {
    document.getElementById("superior").classList.remove("ocult");    // s'elimina la classe provisional del contenidor superior
    document.getElementById("menu").style.display = "flex";    // es mostra el menú
    document.getElementById("div_gran").style.display = "none";    // s'oculta el contenidor de pantalla completa
    if (seccio_origen == 2) {    // càmera
        document.getElementById("seccio_2").style.display = "flex";
    } else {    // galeria
        document.getElementById("seccio_3").style.display = "flex";
    }
} 
function omple_llista() {
    let llista = '';
    indexedDB.open("Dades").onsuccess = event => {
        event.target.result.transaction(["Fotos"], "readonly").objectStore("Fotos").index("Usuari_index").getAll(usuari).onsuccess = event => {
            dades = event.target.result;
            for (i in dades) {    // per cada foto
                llista+= '<div class="llista_fila"><div><img src="';    // es crea un contenidor de fila
                llista+= dades[i]["Foto"];    // miniatura de la foto
                llista+= '" onclick="mostra_foto(';    // atribut d'esdeveniment (mostrar la foto)
                llista+= dades[i]["ID"];    // valor numèric que identifica el registre de la foto
                llista+= ')" /></div><span>'; 
                llista+= dades[i]["Data"];    // data i hora de la foto
                llista+= '</span><i class="fa-solid fa-trash" onclick="esborra_foto(';    // atribut d'esdeveniment (esborrar la foto)
                llista+= dades[i]["ID"];
                llista+= ')"></i></div>';         
            }
            document.getElementById("llista_fotos").innerHTML = llista;    // s'ocupa el contenidor "llista_fotos" amb el fragment HTML creat
        }
    }
}
function esborra_foto(id) {
    if (confirm("Vols esborrar la foto?")) {    // es demana la confirmació a l'usuari
        indexedDB.open("Dades").onsuccess = event => {   
                event.target.result.transaction("Fotos", "readwrite").objectStore("Fotos").delete(id).onsuccess = () => {
                alert("La foto s'ha esborrat.");
                canvia_seccio(3);    // es recarrega la galeria per tal que ja no mostri la foto esborrada
            };
        };
    }
}
if (num_boto == 4) {
    mapa.invalidateSize();
}
let vegueries = [[41.39, 2.17, "Àmbit metropolità (Barcelona)"],    // llista on cada element és una llista amb els valors de latitud, longitud i nom de vegueria com a elements
                 [42.17, 0.89, "Alt Pirineu i Aran (Tremp)"],
                 [41.12, 1.24, "Camp de Tarragona (Tarragona)"],
                 [41.73, 1.83 ,"Comarques centrals (Manresa)"],
                 [41.98, 2.82, "Comarques gironines (Girona)"],
                 [41.62, 0.62, "Ponent (Lleida)"],
                 [40.81, 0.52, "Terres de l'Ebre (Tortosa)"],
                 [41.35, 1.70, "Penedès (Vilafranca del Penedès"]];
for (i in vegueries) {    // per cada element de la llista
    L.marker([vegueries[i][0], vegueries[i][1]],{title:vegueries[i][2]}).addTo(mapa);
}
if (num_boto == 4) {
    mapa.invalidateSize();
    if (typeof geoID === "undefined") {    // si encara no s'han obtingut les dades de localització del dispositiu
        navigator.geolocation.watchPosition(geoExit);    // inicia el seguiment de la localització del dispositiu
    }
}
function geoExit(posicio){
    let latitud = posicio.coords.latitude;
    let longitud = posicio.coords.longitude;
    if (typeof geoID === "undefined") {    
        geoID = L.marker([latitud, longitud], {zIndexOffset:100, title:"Usuari"}).addTo(mapa);    // es defineix el marcador  geoID i es situa per sobre dels altres
    } else {    // primeres dades de localització, es crea el marcador d'usuari 
        geoID.setLatLng([latitud, longitud]);    // actualització de la posició del marcador d'usuari en el mapa
    }
}
