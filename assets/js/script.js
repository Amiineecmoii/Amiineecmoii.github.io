const items = document.querySelectorAll(".fade");

const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("show");
    }
  })
},{threshold:.15});

items.forEach(i=>obs.observe(i));
