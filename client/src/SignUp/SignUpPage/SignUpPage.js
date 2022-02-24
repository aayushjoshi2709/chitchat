import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = (props) => {
	let navigate = useNavigate();
	function signmeup(e){
		if(props.login(e)){
			navigate('/messaging');
		}
	}
	return (
		<div className="container">
			<div className="row">
				<div className="col-sm-10 col-md-6" style={{ margin: "30px auto" }}>
					<div className="p-4" style={{ backgroundColor: "rgba(225,225,225,0.4)" }}>
						<form action="/register" method="post" onSubmit={(e) => { signmeup(e) }}>
							<h1 className="display-1 m-2" style={{ textAlign: "center" }}>Sign Up</h1>
							<div className="form-group m-2 mt-4">
								<input type="text" className="form-control" placeholder="First Name" required name="firstName"></input>
							</div>
							<div className="form- m-2">
								<input type="text" className="form-control" placeholder="Last Name" required name="lastName"></input>
							</div>
							<div className="form-group m-2">
								<input type="email" className="form-control" placeholder="Enter email" required name="email"></input>
							</div>
							<div className="form-group m-2">
								<input type="text" className="form-control" placeholder="username" required name="username"></input>
							</div>
							<div className="form-group m-2">
								<input type="password" className="form-control" placeholder="Password" required name="password"></input>
							</div>
							<div className="form-group m-2">
								<input type="password" className="form-control" placeholder="Password" required></input>
							</div>
							<div className="text-center">
								<button type="submit" className="btn-lg btn-primary btn-block">Signup</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}
export default SignUpPage;