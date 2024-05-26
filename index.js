let validat = false;
let nom, contrasenya;
let scriptURL = "https://script.google.com/macros/s/AKfycbygt4C300R84kIvF3Cqi0j1gc1LKBC_sfDCF0Xu80SmTmMg6xN9pwELEXatqaWmj91T/exec"; // Sustituir por la URL del script correcto

function canvia_seccio(num_boto) {
    const menu = document.getElementById("menu");
    const num_botons = menu.children.length;
    for (let i = 1; i < num_botons; i++) {
        let boto = document.getElementById("boto_" + i);
        let seccio = document.getElementById("seccio_" + i);
        if (i === num_boto) {
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
        .then((resposta) => resposta.json())
        .then((resposta) => {
            console.log("Datos recibidos:", resposta);
            if (resposta.length === 0) {
                window.alert("El nom d'usuari o la contrasenya no són correctes.");
            } else {
                window.alert("S'ha iniciat correctament la sessió.");
                inicia_sessio_correcta();
            }
        })
        .catch((error) => {
            console.error("Error en la solicitud:", error);
        });
}

function inicia_sessio_correcta() {
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
                            inicia_sessio_correcta();
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

function mostra_foto(id) {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let imatge = new Image();
    if (id === 0) { // darrera foto realitzada, potser sense desar
        seccio_origen = 2; // origen en la seccció "càmera"
        document.getElementById("seccio_2").style.display = "none"; // s'oculta la secció "càmera"
        imatge.src = document.getElementById("foto").src;
    } else {
        seccio_origen = 3; // origen en la seccció "galeria"
        indexedDB.open("Dades").onsuccess = event => { // s'obté la foto de la base de dades
            event.target.result.transaction(["Fotos"], "readonly").objectStore("Fotos").get(id).onsuccess = event => {
                document.getElementById("seccio_3").style.display = "none"; // s'oculta la secció "galeria"
                imatge.src = event.target.result["Foto"];
            }
        }
    }
    imatge.onload = () => { // esdeveniment que es produeix un cop s'ha carregat la imatge
        if (imatge.width > imatge.height) { // imatge apaïsada
            canvas.width = imatge.height;
            canvas.height = imatge.width;
            context.translate(imatge.height, 0);
            context.rotate(Math.PI / 2);
        } else { // imatge vertical
            canvas.width = imatge.width;
            canvas.height = imatge.height;
        }
        context.drawImage(imatge, 0, 0, imatge.width, imatge.height);
        document.getElementById("foto_gran").src = canvas.toDataURL("image/jpeg", 0.5);
    }
    document.getElementById("superior").classList.add("ocult"); // s'oculta provisionalment el contenidor superior
    document.getElementById("menu").style.display = "none"; // s'oculta el menú
    document.getElementById("div_gran").style.display = "flex"; // es mostra el contenidor de la foto a pantalla completa
}

function retorn_a_seccio() {
    document.getElementById("superior").classList.remove("ocult"); // s'elimina la classe provisional del contenidor superior
    document.getElementById("menu").style.display = "flex"; // es mostra el menú
    document.getElementById("div_gran").style.display = "none"; // s'oculta el contenidor de pantalla completa
    if (seccio_origen === 2) { // càmera
        document.getElementById("seccio_2").style.display = "flex";
    } else { // galeria
        document.getElementById("seccio_3").style.display = "flex";
    }
}
