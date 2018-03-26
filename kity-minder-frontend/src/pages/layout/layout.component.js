export class LayoutComponent {
  static selector = 'layoutComponent';
  static templateUrl = 'pages/layout/layout.html';
  static $routeConfig = [
    { path: '/', name: 'Editor', component: 'editorComponent' },
    { path: '**', name: 'NotFound', component: 'notfoundComponent' }
  ];
  static $bindings = {
    $router: '<'
  };
  static $canActivate() {
    return true;
  }
  constructor() {}
  $routerOnActivate(next, previous) {}
}
