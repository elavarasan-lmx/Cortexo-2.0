<?php
$no_visible_elements = true;
include('include/header.php'); ?>

    <div class="row">
        <div class="col-md-12 center login-header">
            <h4>Hi! <?php  if(isset($_COOKIE['terminate_admin'])) { echo ucfirst($_COOKIE['terminate_admin']);}
		else {echo '';}	?>, Enter your security code..</h4>
        </div>
        <!--/span-->
    </div><!--/row-->

    <div class="row">
        <div class="well col-md-5 center login-box">
            
               	<?php 
				    $error_data = "User already logged in somewhere, Terminate the session";     
					echo '<div class="alert alert-danger">'.$error_data.'</div>';
					//Opening form
					echo form_open('C_main/terminate_usersession'); 
				?> 
            
                <fieldset>
                    <div class="input-group input-group-lg">
                        <!--<span class="input-group-addon"><i class="glyphicon glyphicon-user red"></i></span> -->
                        <input type="hidden" id="user_name" name="user_name" class="form-control" readonly placeholder="Username"  value="<?php  if(isset($_COOKIE['terminate_admin'])) { echo $_COOKIE['terminate_admin'];}
		else {echo '';}	?>" >
                    </div>
                    <div class="clearfix"></div><br>

                    <div class="input-group input-group-lg">
                        <span class="input-group-addon"><i class="glyphicon glyphicon-lock red"></i></span>
                        <input type="password" id="security_code" name="security_code" class="form-control" placeholder="Security Code">
                    </div>
                  <?php /*     <div class="clearfix"></div>

                 <div class="input-prepend">
                        <label class="remember" for="remember"><input type="checkbox" id="remember"> Remember me</label>
                    </div> */?>
                    <div class="clearfix"></div>

                    <p class="center col-md-5">
                        <button type="submit" id="login" class="btn btn-primary">Submit</button>
                    </p>
                </fieldset>
            </form>
        </div>
        <!--/span-->
    </div><!--/row-->
<?php require('include/footer.php'); ?>