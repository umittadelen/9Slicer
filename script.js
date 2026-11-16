const img = document.getElementById("texture-preview");
const sliceV = document.getElementById("slice-v");
const sliceH = document.getElementById("slice-h");
const output = document.getElementById("output");
const format = document.getElementById("format");
const copyBtn = document.getElementById("copy");
let fileName = "texture.png";

const val = (id) => Math.max(0, parseInt(document.getElementById(id).value) || 0);

const formats = {
    css: (t, r, b, l, w, h, s) =>
        `border-style: solid;\n` +
        `border-width: ${t * s}px ${r * s}px ${b * s}px ${l * s}px;\n` +
        `border-image: url("${fileName}") ${t} ${r} ${b} ${l} fill / ${t * s}px ${r * s}px ${b * s}px ${l * s}px;\n` +
        `image-rendering: pixelated;`,
    unity: (t, r, b, l) =>
        `L: ${l}  T: ${t}  R: ${r}  B: ${b}\n` +
        `new Vector4(${l}, ${b}, ${r}, ${t})`,
    minecraft: (t, r, b, l, w, h) => JSON.stringify({
        gui: { scaling: { type: "nine_slice", width: w, height: h, border: { left: l, top: t, right: r, bottom: b } } }
    }, null, 2),
    godot: (t, r, b, l) =>
        `patch_margin_left = ${l}\npatch_margin_top = ${t}\npatch_margin_right = ${r}\npatch_margin_bottom = ${b}`,
};

function update() {
    if (!img.naturalWidth) return;
    const w = img.naturalWidth, h = img.naturalHeight;
    img.style.width = (160 * w) / h + "px";

    const t = val("top-border"), r = val("right-border"), b = val("bottom-border"), l = val("left-border");

    const sx = img.offsetWidth / w, sy = img.offsetHeight / h;
    sliceV.style.left = Math.round(l * sx) + "px";
    sliceV.style.right = Math.round(r * sx) + "px";
    sliceH.style.top = Math.round(t * sy) + "px";
    sliceH.style.bottom = Math.round(b * sy) + "px";

    output.value = formats[format.value](t, r, b, l, w, h, val("scale") || 1);
}

function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    fileName = file.name;
    img.src = URL.createObjectURL(file);
}

document.getElementById("texture").addEventListener("change", (e) => loadFile(e.target.files[0]));

window.addEventListener("dragover", (e) => {
    e.preventDefault();
    document.body.classList.add("dragging");
});
window.addEventListener("dragleave", (e) => {
    if (!e.relatedTarget) document.body.classList.remove("dragging");
});
window.addEventListener("drop", (e) => {
    e.preventDefault();
    document.body.classList.remove("dragging");
    loadFile(e.dataTransfer.files[0]);
});

img.addEventListener("load", update);
window.addEventListener("resize", update);
document.querySelectorAll("input[type=number], select").forEach((el) => el.addEventListener("input", update));

copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(output.value);
    copyBtn.classList.add("copied");
    setTimeout(() => copyBtn.classList.remove("copied"), 1000);
});

const blank = document.createElement("canvas");
blank.width = blank.height = 16;
img.src = blank.toDataURL();

window.addEventListener("load", () => document.body.classList.add("ready"));