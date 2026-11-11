import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchBar } from '../../shared/search-bar/search-bar';
import { BoatCard } from '../../shared/boat-card/boat-card';
import { BOATS } from '../../core/data/boats';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SearchBar, BoatCard],
  templateUrl: './home.html'
})
export class Home {
  boats = BOATS;
}