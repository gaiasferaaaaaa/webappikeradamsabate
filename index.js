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
