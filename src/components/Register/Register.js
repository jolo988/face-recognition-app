import React from "react";

/*
1) create frontend component (including inputs)
2) style components
3) create/test frontend onRouteChange to capture data (Class/routes)
4) load data to app (frontend)
5) Connect to backend server
6) load user + route change home
*/

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: ''
        }
    }

    //listen to onchange event of name
    onNameChange = (event) => {
        this.setState({name: event.target.value})
    }

    //listen to onchange event of email
    onEmailChange = (event) => {
        this.setState({email: event.target.value})
    }

    //listen to onchange event of email
    onPasswordChange = (event) => {
        this.setState({password: event.target.value})
    }
    
    OnSubmitSignIn = () => {
        fetch('http://localhost:8081/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: this.state.name,
                email: this.state.email,
                password: this.state.password
            })
        })
            //parse response from server
            .then(response => response.json())
            //if receive user -> route change to home, using 'user' from server
            .then(user => {
                if (user.id) {
                    //state built in apps bc it'll be used through out whole app
                    //loading user(update user profile on frontend) + changing route to home
                    this.props.loadUser(user);
                    this.props.onRouteChange('home');
                }
            })
        
    }

    render() {
        return (
            <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
                <main className="pa4 black-80">
                    <div className="measure">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                        <legend className="f1 fw6 ph0 mh0">Register</legend>
                        <div className="mt3">
                            <label className="db fw6 lh-copy f6" htmlFor="Name">Name</label>
                            <input 
                                className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                                type="text" 
                                name="name"  
                                id="name" 
                                onChange={this.onNameChange}
                            />
                        </div>
                        <div className="mt3">
                            <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                            <input 
                                className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                                type="email" 
                                name="email-address"  
                                id="email-address" 
                                onChange={this.onEmailChange}
                            />
                        </div>
                        <div className="mv3">
                            <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                            <input 
                                className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                                type="password" 
                                name="password"  
                                id="password" 
                                onChange={this.onPasswordChange}
                            />
                        </div>
                        </fieldset>
                        <div className="">
                        <input 
                            onClick={this.OnSubmitSignIn} 
                            className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" 
                            type="submit" 
                            value="Register" 
                        />
                        </div>
                    </div>
                </main>
            </article>
        );
    }
}


export default Register;