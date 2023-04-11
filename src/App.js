import * as React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import UploadPage from './UploadPage';
import MusicPlayer from './MusicPlayer';

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={UploadPage} />
        <Route path="/musicPlayer/:id" component={MusicPlayer} />
      </Switch>
    </BrowserRouter>
  );
}
