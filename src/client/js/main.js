import regeneratorRuntime from "regenerator-runtime";
import "../scss/styles.scss";

let openButton = document.querySelector('.openNavBtn');
let closeButton = document.querySelector('.closeNavBtn');
let navBar = document.querySelector('nav');
let main = document.querySelector('main');
let blur = document.querySelector('.blurDiv');

openButton.addEventListener('click', function() {
    navBar.classList.add('navWidth');
    navBar.classList.remove('none');
    blur.classList.add('blurDivStyle');
});

closeButton.addEventListener('click', function() {
    navBar.classList.remove('navWidth');
    navBar.classList.add('none');
    blur.classList.remove('blurDivStyle');
});