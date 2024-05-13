import React from 'react';
import './App.css';
import {Layout} from "./components/Layout";
import {Provider} from "react-redux";
import {AudioProvider} from "./components/Audio";
import store from "./store"

function App() {
    return (
      <AudioProvider>
        <Provider store={store}>
            <div>
                <Layout/>
            </div>
        </Provider>
      </AudioProvider>
  );
}

export default App;
