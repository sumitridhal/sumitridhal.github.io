import { Component, HostBinding, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
// import * as PIXI from 'pixi.js';
// import { TweenMax } from 'gsap/all';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('pixi') pixi: ElementRef;
  @HostBinding('class') classes = 'app';
  public app: any;
  displacementSprite: any;
  displacementFilter: any;
  basicText: any;
  container: any;
  maskTween: any;

  ngOnInit(): void { }

  ngAfterViewInit() {
    // const pixiAppObj = { width: 500, height: 150, backgroundColor: 0xF0F0F0 };
    // this.app = new PIXI.Application(pixiAppObj);
    // this.pixi.nativeElement.appendChild(this.app.view);
    // this.app.loader.load(() => this.onAssetsLoaded());
  }

  // onAssetsLoaded() {
  //   this.app.stage.interactive = true;
  //   const container = new PIXI.Container();
  //   this.app.stage.addChild(container);

  //   this.displacementSprite = PIXI.Sprite.from(
  //     "../assets/images/displace4.png"
  //   );

  //   const displacementFilter = new PIXI.filters.DisplacementFilter(
  //     this.displacementSprite
  //   );

  //   this.app.stage.addChild(this.displacementSprite);

  //   container.filters = [displacementFilter];

  //   displacementFilter.scale.x = displacementFilter.scale.y = 10;
  //   displacementFilter.autoFit = true;
  //   this.displacementSprite.anchor.set(0.5);
  //   const bounds = this.pixi.nativeElement.getBoundingClientRect();
  //   this.displacementSprite.position.set(bounds.left, bounds.top);

  //   const style = new PIXI.TextStyle({
  //     fontFamily: "Anton",
  //     fontSize: 65,
  //     fill: '#000',
  //     letterSpacing: 0.8
  //   })
  //   const basicText = new PIXI.Text('I AM SUMIT RIDHAL', style);
  //   basicText.filters = [displacementFilter];
  //   this.app.stage.addChild(basicText);

  //   this.app.ticker.add((e) => this.animateFilter(e, this.displacementSprite));

  //   this.app.stage
  //     .on("mousemove", (event) => {
  //       this.onPointerMove(event, this.displacementSprite)
  //     })
  //     .on("touchmove",  (event) => {
  //       this.onPointerMove(event, this.displacementSprite)
  //     });
  // }

  // onPointerMove(e, s) {
  //   if (s && e) {
  //     const bounds = this.pixi.nativeElement.getBoundingClientRect();
  //     this.maskTween && this.maskTween.pause();
  //     this.maskTween = TweenMax.to(s.position, 1.5, {
  //       x: e.data.global.x - bounds.left,
  //       y: e.data.global.y - bounds.top,
  //       ease: "Power4.easeOut"
  //     })
  //   }
  // }

  // animateFilter(e, s) {
  //   s && s.anchor && null != s && (s.rotation += .008)
  // }


}
