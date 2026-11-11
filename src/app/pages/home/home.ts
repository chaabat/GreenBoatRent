import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchBar } from '../../shared/search-bar/search-bar';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SearchBar],
  templateUrl: './home.html'
})
export class Home {}