import React from 'react';
import TopBar from './topbar.jsx';
import BackArrow from './backarrow.jsx';
import BottomBar from './bottombar.jsx';

class Colour extends React.Component{
  render(){
    return (
      <div>
        <TopBar/>
        <div className="top-text">
          <button className="arrow-button">
            <BackArrow palette={{backarrow:'#a0a2a3'}}/>
          </button>
          <p className="select-colour">Select which colour you’d like to use:</p>
        </div>
        <div className="blue-box">
          <div className="blue-square"></div>
          <button className="colour-text">Blue</button>
        </div>
        <div className="green-box">
          <div className="green-square"></div>
          <button className="colour-text">Green</button>
        </div>
        <div className="pink-box">
          <div className="pink-square"></div>
          <button className="colour-text">Pink</button>
        </div>
        <div className="purple-box">
          <div className="purple-square"></div>
          <button className="colour-text">Purple</button>
        </div>
          <BottomBar/>
      </div>
    )
  }
}

export default Colour;
