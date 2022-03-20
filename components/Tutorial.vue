<template>
    <div>
      <div class="loading__modal" v-show="loadingModal">
        <div class="loading__modal-container">
          <h3>Recovering data in progress...</h3>
          <p>Loading : <span class="loading__count">{{loading}}</span>/1560.</p>
        </div>
      </div>

      <header class="header">
        <h1 class="header__title">Marvel API</h1>
        <h2 class="header__subtitle">Create your dream team</h2>
        <div class="search-form">
          <div class="search-form__container">
            <input placeholder="Search for a word..." class="search-form__input" type="search" title="Search " v-model="search">
            <button class="search-form__submit" type="submit" title="Search " aria-label="Search">
              <img src="../assets/data/search-icon.svg" class="search-icon">
            </button>
          </div>
        </div>
        <button class="header__btn" v-on:click="randomCharacters">Get 10 random characters</button>
      </header>

      <section class="main">
        <div class="item__container">
          <ul class="item__list-container">
            <li v-for="value in filteredList" :key="value.id" class="item__list">
              <div v-on:click="showDetails(value.id);getComics(value.id)" class="item__div">
                <img class="item__img" :src="value.thumbnail.path + '.' + value.thumbnail.extension">
                <p class="item__name">{{value.name}}</p>
              </div>
              <div v-if="show.includes(value.id)" class="modal">
                <div class="modal__container">
                  <div class="modal__div-img">
                    <button class="modal__close-btn" v-on:click="closeModal()">Close</button>
                    <img class="modal__img" :src="value.thumbnail.path + '.' + value.thumbnail.extension">
                    <button class="item__add-btn" v-on:click="addToTeam(value.name)">Add to my team</button>
                  </div>
                  <div class="modal__div-detail">
                    <p class="modal__name">{{value.name}}</p>
                    <p class="modal__content">{{value.description}}</p>
                    <p class="modal__content"><span>Comics in which the character appears:</span></p>
                    <ol>
                      <li v-for="comic in comics" :key="comic.name">
                        <p class="modal__content"><span>Title :</span> {{comic.name}}</p>
                        <p class="modal__content"><span>Date :</span> {{comic.date}}</p>
                        <p class="modal__content"><span>Description :</span> {{comic.description}}</p>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="team">
          <div class="team__container">
            <div class="team__save">
              <input type="text" id="teamName" class="team__input" name="inputTeamName" placeholder="Name of the team">
              <button class="team__btn" @click="saveTeam">Save</button>
            </div>
            <ul class="team__list-container">
              <li v-show="checkEmptyTeam">
                <p class="team__list-item">Empty team</p>
              </li>
              <li v-for="hero in team" :key="hero.name">
                <p class="team__list-item">{{hero}}
                  <span class="team__list-btns">
                    <img class="team__list-btn" v-on:click="deplaceDown(hero)" src="../assets/data/arrow-down.svg">
                    <img class="team__list-btn" v-on:click="deplaceUp(hero)" src="../assets/data/arrow-up.svg">
                    <img class="team__list-btn" v-on:click="removeFromTeam(hero)" src="../assets/data/delete-icon.svg">
                  </span>
                </p>
              </li>
            </ul>
            <div class="team__clean">
              <button class="team__clean-btn" v-on:click="removeAllFromTeam()">Clear</button>
            </div>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="footer__content">
          <a class="footer__top" href="#">Back to top</a>
        </div>
        <div class="footer__content">
          <p class="footer__text">Data provided by Marvel. © 2014 Marvel</p>
          <p class="footer__text">Created by <a target="_blank" href="https://www.alexis-gousseau.com">Alexis Gousseau</a> and <a target="_blank" href="https://www.gaetan-moreau.fr">Gaëtan Moreau</a>.</p>
        </div>
      </footer>
    </div>
</template>

<script>
import MD5 from "crypto-js/md5";
import shuffle from 'lodash/shuffle';

export default {
  name: "get-request",
    data() {
    return {
      characters: [
        {
          id: null,
          name: null,
          description: null,
          thumbnail: {
            path: null,
            extension: null,
          },
        }
      ],
      comics: [
        {
          name: null,
          date: null,
          description: null,
        }
      ],
      search: '',
      show: [],
      team : [],
      checkEmptyTeam: true,
      resCharactersEnd: [],
      resComics: [],
      loading: null,
      loadingModal: true,
    };
  },
async created() { //Récupère l'ensemble des héros disponibles
    if(localStorage.characters){ //Vérifie si des héros ont été sauvegardé dans le localStorage
      this.characters = JSON.parse(localStorage.getItem("characters"));
      this.loadingModal = false;
    }
    else{
      let apiKeyPrivate = "96d0839264d3ef46eac9f5e00d453ab15a5d4ead";
      let apiKeyPublic = "212ec27bd874218eebb4bf80be8e0529";
      let ts = Date.now();
      let hash = MD5(ts + apiKeyPrivate + apiKeyPublic);

      for(let s = 0 ; s <= 1600 ; s += 100){ //Récupère le nom, l'id, la description et le thumbnail pour chaque héros (1560)
        this.loading = s
        if(s === 1600){
          this.loadingModal = false;
        }
        const requete = await fetch("https://gateway.marvel.com/v1/public/characters?offset=" + s + "&limit=100&ts=" + ts + "&apikey=" + apiKeyPublic + "&hash=" + hash + "");
        var resJson = await requete.json();
        
        for(let i = 0 ; i < resJson.data.results.length ; i ++){
          if(resJson.data.results[i].description === ""){
            resJson.data.results[i].description = "No description for this character";
          }
          this.resCharactersEnd.push({"name":resJson.data.results[i].name, "id":resJson.data.results[i].id, "description":resJson.data.results[i].description, "thumbnail":resJson.data.results[i].thumbnail});
        }
      }
      localStorage.setItem("characters", JSON.stringify(this.resCharactersEnd)); //Sauvegarde les données récupérer dans le localStorage

      this.characters = this.resCharactersEnd;
    }
  },
  mounted() { // Récupère l'équipe enregistré en localStorage
    if(localStorage.team && localStorage.team.length > 2){
      this.checkEmptyTeam = false;
      this.team = JSON.parse(localStorage.getItem("team"))
      document.getElementById('teamName').value = localStorage.getItem("teamName")
    }
  },
  computed: {
    filteredList() { // Défini le nombre de personnage à afficher sur la page
      var self = this;
      if(this.search.length > 2){
        return this.characters.filter(function(character){
          return character.name.toLowerCase().indexOf(self.search.toLowerCase()) >= 0 || character.description.toLowerCase().indexOf(self.search.toLowerCase()) >= 0;
        });
      }
      else{
        return this.characters.slice(0, 10);
      }
    },
  },
  methods: {
    randomCharacters: function () { //Mélange l'ordre des héros
      this.characters = shuffle(this.characters)
    },
    saveTeam() { //Sauvegarde l'équipe créée dans le localStorage
      localStorage.setItem("team", JSON.stringify(this.team));
      localStorage.setItem("teamName", document.getElementById('teamName').value)
    },
    showDetails(id) { // Vérifie si l'id du personnage est dans le tableau show, si oui, les détails du personnage s'affichent
      if (this.show.includes(id)) {
        this.show = this.show.filter(entry => entry !== id);
        return; 
      }
      this.show = [];
      this.show.push(id);
    },
    async getComics(id){ //Permet de récupérer les comics dans lequel le héros apparaît
      let apiKeyPrivate = "ec83233405e34d088daac39044b993316eeb8c4f";
      let apiKeyPublic = "f8b60f51b4ea0d18688590821111c2f9";
      let ts = Date.now();
      let hash = MD5(ts + apiKeyPrivate + apiKeyPublic);
    
      const response = await fetch("https://gateway.marvel.com/v1/public/characters/" + id + "/comics?limit=100ts=" + ts + "&apikey=" + apiKeyPublic + "&hash=" + hash + "");
      const dataComics = await response.json();
      const allComics = dataComics.data.results;
      
      if(allComics.length > 0){
        let allDatesComics = [];
        for(let i = 0 ; i < allComics.length ; i ++){
          allDatesComics.push(allComics[i].dates[0].date)
        }
        if(allDatesComics.length > 1){
          var oldest = allDatesComics.reduce(function (pre, cur) { //Retrouve la date la plus ancienne
            return Date.parse(pre) > Date.parse(cur) ? cur : pre;
          });
          var earliest = allDatesComics.reduce(function (pre, cur) { //Retrouve la date la plus récente
            return Date.parse(pre) < Date.parse(cur) ? cur : pre;
          });

          this.comics = [];
          this.resComics = [];
          for(let j = 0 ; j < allComics.length ; j ++){
            if(allComics[j].description === null){
              allComics[j].description = "No description for this comic.";
            }
            if(allComics[j].dates[0].date === oldest){
              this.resComics.push({"name":allComics[j].title, "date":oldest.split("T")[0], "description":allComics[j].description});
            }
            if(allComics[j].dates[0].date === earliest){
              this.resComics.push({"name":allComics[j].title, "date":earliest.split("T")[0], "description":allComics[j].description});
            }
          }
          //Récupère les deux dates (ancienne et récente) dans le cas où plusieurs comics sont apparut le même jour que ces mêmes dates
          this.comics.push(this.resComics[0]);
          this.comics.push(this.resComics[this.resComics.length - 1]);
        }
        else{
          this.comics= [{"name":allComics[0].title, "date":allDatesComics[0].split("T")[0], "description":allComics[0].description}];
        }   
      }
      else{
        this.comics = [];
        this.comics.push({"name":"No related comics.", "date":"No date available.", "description":"No description available."})
      }
    },
    addToTeam(name) { //Ajoute un héro à l'équipe
      this.checkEmptyTeam = false;
      this.team = this.team.filter(entry => entry !== name);
      this.team.push(name);
    },
    removeFromTeam(hero){ //Supprime un héro de l'équipe
      if(this.team.includes(hero)) {
        this.team = this.team.filter(entry => entry !== hero);
        if(this.team.length === 0){
          this.checkEmptyTeam = true;
        }
        return; 
      }
    },
    removeAllFromTeam(){ //Supprime entièrement l'équipe créée
      if(this.team.length === 0){
        this.checkEmptyTeam = true;
      }
      this.team = [];
    },
    closeModal(){ //Ferme le modal des détails du personnage
        this.show = [];
    },
    deplaceUp(hero){ //Déplace le héro ciblé de l'équipe vers le haut
      let teamModified = this.team
      for(let i = 0 ; i < teamModified.length ; i ++) {
        if(teamModified[i] === hero && teamModified[i - 1] != undefined){
          let tmp = teamModified[i - 1];
          teamModified[i - 1] = teamModified[i];
          teamModified[i] = tmp;
        }
      }
      this.removeAllFromTeam();
      this.team =  teamModified
    },
    deplaceDown(hero){ //Déplace le héro ciblé de l'équipe vers le bas
      let teamModified = this.team
      for(let i = teamModified.length - 1 ; i >= 0 ; i --) {
        if(teamModified[i] === hero && teamModified[i + 1] != undefined){
          let tmp = teamModified[i + 1];
          teamModified[i + 1] = teamModified[i];
          teamModified[i] = tmp;
        }
      }
      this.removeAllFromTeam();
      this.team =  teamModified
    }
  }
};
</script>