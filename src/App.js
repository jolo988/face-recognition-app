import React, { Component } from 'react';
import ParticlesBg from 'particles-bg';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import './App.css';

//function to receive user input imageURL -> convert to JSON request
const returnClarifaiRequestOptions = (imageURL) => {
  // Your PAT (Personal Access Token) can be found in the portal under Authentification
  const PAT = '(hid PAT key)';
  // Specify the correct user_id/app_id pairings
  // Since you're making inferences outside your app's scope
  const USER_ID = '(hid username)';       
  const APP_ID = 'my-first-application';
  // Change these to whatever model and image URL you want to use
  const MODEL_ID = 'face-detection';  
  const IMAGE_URL = imageURL;

  //converting user input to raw json stringify
  const raw = JSON.stringify({
    "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
    },
    "inputs": [
        {
            "data": {
                "image": {
                    "url": IMAGE_URL
                }
            }
        }
    ]
  });

  //return request message format w/ image URL
  const requestOptions = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
    },
    body: raw
  };
}

const initialState = {
  input: '',//what the user will input
  imageURL: '',//imageURL should be displayed when clicked onbuttonsubmit
  box: {},
  route: 'signin', //keeps track of which page user is in(app starts on signin page)
  isSignedIn: false,
      //when user joins -> these will be updated in server -> DB
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  }
}
//create state for app to know value that user enters/remembers & updates it
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
    }
  



  //update state w/ user that's received
  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  //return object for box(4 dots to wrap with border)
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }
  //left_col is percentage of width, top row percentage of height
  //rightCol total width - right col percentage
  //bottom row = total height - bottom percentage

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  //property of App: receive an event when input changes
  //get value from user input (event.target.value)
  //pass funct to imagelinkform INPUT
  onInputChange = (event) => {
    this.setState({input:event.target.value});
  }

  //click event to submit
  onButtonSubmit = () => {
    this.setState({imageURL: this.state.input});//update imageURL variable w/ input from imagelinkform -> pass imageURL to facerecognition

    //if no NPM package and if no GRPC NPM package(lowering dependencies)
    // app.models.predict('face-detection', this.state.input)
    fetch("https://api.clarifai.com/v2/models/" + 'face-detection' + "/outputs", returnClarifaiRequestOptions(this.state.input))
      .then(response => {
        if (response) {
          fetch('http://localhost:8081/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count }))
          })
          .catch(console.log)
        }
    
        this.displayFacebox(this.calculateFaceLocation(response))
      })
      .catch((err) => console.log(err));
  }
//once receive response -> calculate face location -> display facebox

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }
  //after signin button clicks -> goes route changes to first page
  //dynamically use route -> route is what we give it

  render() {
    // const { isSignedIn, imageURL, route, box } = is.state;
    return (
      <div className="App">
        <ParticlesBg className='particles' num={100} type="cobweb" bg={true} />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition box={this.state.box} imageURL={this.state.imageURL}/> 
            </div>
          : (
            this.state.route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }
}

export default App;
