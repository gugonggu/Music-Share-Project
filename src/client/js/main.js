import regeneratorRuntime from "regenerator-runtime";
import "../scss/styles.scss";

const openButton = document.querySelector(".openNavBtn");
const closeButton = document.querySelector(".closeNavBtn");
const navBar = document.querySelector("nav");
const main = document.querySelector("main");
const blur = document.querySelector(".blurDiv");

openButton.addEventListener("click", function () {
    navBar.classList.add("navWidth");
    navBar.classList.remove("none");
    blur.classList.add("blurDivStyle");
});

closeButton.addEventListener("click", function () {
    navBar.classList.remove("navWidth");
    navBar.classList.add("none");
    blur.classList.remove("blurDivStyle");
});

blur.addEventListener("click", () => {
    navBar.classList.remove("navWidth");
    navBar.classList.add("none");
    blur.classList.remove("blurDivStyle");
});
