let validat = false;
let nom, contrasenya;
let scriptURL = "https://script.google.com/.../exec"; // Sustituir por la URL del script correcto

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
    let consulta = `${scriptURL}?query=select&where=usuari&is=${nom}&and=contrasenya&equal=${contrasenya}`;
    fetch(consulta)
        .then((resposta) => resposta.json())
        .then((resposta) => {
            if (resposta.length === 0) {
                window.alert("El nom d'usuari o la contrasenya no són correctes.");
            } else {
                window.alert("S'ha iniciat correctament la sessió.");
                inicia_sessio();
            }
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
    fetch(consulta_1)
        .then((resposta) => resposta.json())
        .then((resposta) => {
            if (resposta.length === 0) {
                let consulta_2 = `${scriptURL}?query=insert&values=${nom}$$${contrasenya}`;
                fetch(consulta_2)
                    .then((resposta) => {
                        if (resposta.ok) {
                            window.alert("S'ha completat el registre d'usuari.");
                            inicia_sessio();
                        } else {
                            alert("S'ha produït un error en el registre d'usuari.");
                        }
                    });
            } else {
                alert("Ja existeix un usuari amb aquest nom.");
            }
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
