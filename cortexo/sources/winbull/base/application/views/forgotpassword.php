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
</style>
<div class="container-fluid contant">
	<div class="container forget_head">
		<div class="row">
			<div class="top-div">
				<div class="panel panel-default">
					<div class="panel-heading">
						<strong> Forgot Password ?</strong>
					</div>
					<div class="panel-body">
						<div class="row">
							<div class="center-block">
								<img class="profile-img"
									src="https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120" alt="">
							</div>
						</div>
						<div class="row">
							<div class="col-sm-12 col-xs-12 col-md-10  col-md-offset-1 ">
								<?php echo form_open('C_client_main/forgotpassword', array('id' => 'login', 'class' => 'form-signin', 'autocomplete' => 'off'));  ?>
								<?php if ($this->session->flashdata('success')) { ?>
									<div class="alert alert-success" style="text-align:center">
										<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
										<p><?php echo $this->session->flashdata('success'); ?></p>
									</div>
								<?php } else if ($this->session->flashdata('errorMsg')) { ?>
									<div class="alert alert-danger" style="text-align:center">
										<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
										<p><?php echo $this->session->flashdata('errorMsg'); ?></p>
									</div>
								<?php } ?>
								<div class="form-group">
									<div class="input-group">
										<span class="input-group-addon">
											<i class="glyphicon glyphicon-user"></i>
										</span>
										<input class="form-control" placeholder="Mobile number" name="user_name" id="user_name" type="text" autofocus minlength="10" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
									</div>
								</div>
								<div class="form-group">
									<button type="submit" class="btn btn-lg btn-primary btn-block">Submit</button>
								</div>
								</form>

							</div>
						</div>

					</div>
					<div class="panel-footer " style="color:#000 !important;">
						Don't have an account! <a style="color:#000 !important;" href="<?php echo base_url() ?>index.php/C_client_main/register" onClick=""> Sign Up Here </a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>