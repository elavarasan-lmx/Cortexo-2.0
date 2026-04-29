<style type="text/css">

.profile-img {
	width: 96px;
	height: 96px;
	margin: 0 auto 10px;
	display: block;
	-moz-border-radius: 50%;
	-webkit-border-radius: 50%;
	border-radius: 50%;
}
.login_head{
	padding-top: 20px;
}
.password-container {
            position: relative;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        }
        .password-container input[type="password"],
        .password-container input[type="text"] {
            width: 100%;
            padding: 10px;
            padding-right: 40px; /* Add space for the icon */
            box-sizing: border-box;
        }
        .password-container .toggle-password {
            position: absolute;
            right: 10px;
            top: 10px;
            /* transform: translateY(-50%); */
            cursor: pointer;
			color : #000;
			z-index: 9;
        }
</style>
<script type="text/javascript">
function preventBack(){window.history.forward();}
function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-icon');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}
setTimeout("preventBack()", 0);

window.onunload=function(){null};
</script>
<div class="container-fluid contant">
	<div class="container login_head" style="">
		<div class="row">
			<div class="top-div">
				<div class="panel panel-default">
					<div class="panel-heading">
						<strong> Sign in to continue</strong>
					</div>
					<div class="panel-body">
						<div class="row">
							<div class="center-block">
								<img class="profile-img"
									src="https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120" alt="">
							</div>
						</div>
						<div class="row">
							<div class="col-sm-12 col-md-10  col-md-offset-1 ">
							<?php if($this->session->flashdata('success') != '') { ?>
								<div class="alert alert-success" style="text-align:center">
									<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
									<p><?php echo $this->session->flashdata('success'); ?></p>
								</div>     
								<?php } else if($this->session->flashdata('errorMsg') != '') { ?>					 
								<div class="alert alert-danger" style="text-align:center">
									<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
									<p><?php echo $this->session->flashdata('errorMsg'); ?></p>
								</div> 
								<?php } ?>
								<?php echo form_open('C_client_main/login_validation' , array('id' => 'login', 'class' => 'form-group center-block login','autocomplete'=>'off'));  ?>
									
								<div class="form-group form-login">
									<div class="input-group">
										<span class="input-group-addon">
											<i class="glyphicon glyphicon-user"></i>
										</span> 
										<input class="form-control" placeholder="Enter your mobile number" name="user_name" id="user_name" type="text" inputmode="numeric" maxlength="10" oninput="this.value=this.value.replace(/[^0-9]/g,'');" autofocus>
										
									</div>
								</div>
								<div class="form-group form-login">
									<div class="input-group">
										<span class="input-group-addon">
											<i class="glyphicon glyphicon-lock"></i> 
										</span>
										<div class="password-container">
											<input class="form-control"  placeholder="Enter your password" name="user_password" id="password" type="password" value="" minlength="6" maxlength="30">
											<span class="toggle-password" onclick="togglePassword()">
												<i id="toggle-icon" class="fa fa-eye-slash"></i>
											</span>
										</div>
									</div>
								</div>
								
								<div class="form-group form-login">
									<button type="submit" class="btn btn-lg btn-primary btn-block">Login</button>
								</div>
								</form>
							</div>
						</div>
					</div>
					<div class="panel-footer ">
						<span style="text-align: left">New user? <a href="<?php echo base_url() ?>index.php/C_client_main/register" onClick="" style="color: #000 !important;"> Click here </a> </span>
						<span style="float: right;"> <a  style="color: #000 !important;"href="<?php echo base_url() ?>index.php/C_client_main/forgotpassword"> Forgot password? </a> </span>
					</div>
                </div>
			</div>
		</div>
	</div>
</div><br><br><br><br>