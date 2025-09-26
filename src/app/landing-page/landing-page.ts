import { Component } from '@angular/core';
import { Header } from "../header/header";
import {  FeaturesInfo } from "./features/about";

@Component({
  selector: 'app-landing-page',
  imports: [Header, FeaturesInfo],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {

}
