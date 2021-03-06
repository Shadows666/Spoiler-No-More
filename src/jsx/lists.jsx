import React from 'react';
import TopBar from './topbar.jsx';
import BottomBar from './bottombar.jsx';
import TopSliderLists from './topsliderlists.jsx';
import ListOfLists from './listoflists.jsx';
import { Link } from 'react-router';

class Lists extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      lists: []
    }
  }

  componentWillMount() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this.setState({
          lists: JSON.parse(xhr.response)
        });
      }
    }.bind(this);
    xhr.open("GET", "/listsowned");
    xhr.send();
  }

  render(){
    var listsowned = this.state.lists.map((e, i) => {
      return <ListOfLists listData={e} key={i}/>
    });

    return (
      <div>
        <TopBar/>
        <TopSliderLists/>
        <button className="lists-button"><Link to="/createnewlist"><i className="material-icons add-new-list">add_circle</i></Link></button>
          <div className="lists-list">
            {listsowned}
          </div>
        <BottomBar/>
      </div>
    )
  }
}

export default Lists;
