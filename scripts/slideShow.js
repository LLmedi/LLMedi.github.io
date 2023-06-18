var slideshow1 = document.getElementById("slideshow");
slideshow1.currentSlideIndex = 1;
showSlides(slideshow1.currentSlideIndex, slideshow1);

/*var slideshow2 = document.getElementById("slideshow-ghost-run");
slideshow2.currentSlideIndex = 1;
showSlides(slideshow2.currentSlideIndex, slideshow2);

var slideshow3 = document.getElementById("slideshow-link-model");
slideshow3.currentSlideIndex = 1;
showSlides(slideshow3.currentSlideIndex, slideshow3);

var slideshow4 = document.getElementById("slideshow-sea");
slideshow4.currentSlideIndex = 1;
showSlides(slideshow4.currentSlideIndex, slideshow4);

var slideshow5 = document.getElementById("slideshow-lift-board");
slideshow5.currentSlideIndex = 1;
showSlides(slideshow5.currentSlideIndex, slideshow5);*/


function plusSlides(n, slideshow) {
  showSlides(slideshow.currentSlideIndex += n, slideshow);
}

function currentSlide(n, slideshow) {
  showSlides(slideshow.currentSlideIndex = n, slideshow);
}

function showSlides(n, slideshow) {
  
  var i;
  var slides = slideshow.getElementsByClassName("slide");
  /* var dots = slideshow.getElementsByClassName("dot"); */

  if (n > slides.length) {slideshow.currentSlideIndex = 1}    
  if (n < 1) {slideshow.currentSlideIndex = slides.length}

  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
      slides[i].style.visibility = "hidden";
  }
  /* for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  } */

  slides[slideshow.currentSlideIndex-1].style.display = "flex";
  slides[slideshow.currentSlideIndex-1].style.visibility = "visible"; 
  /* dots[slideshow.currentSlideIndex-1].className += " active"; */
  
}