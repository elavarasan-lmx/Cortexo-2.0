<script type="text/javascript">
   const BASE_URL = '<?php echo site_url(); ?>'; 
   
    function togglePassword() {
        const pass_input = document.getElementById('user_password');
        const icon = document.querySelector('.toggle-password');
        
        if (pass_input.type === 'password') {
            pass_input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            pass_input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    function validateLogin() {
        var username = document.getElementById('user_name').value.trim();
        var password = document.getElementById('user_password').value.trim();
        
        if (!username && !password) {
            showToast('Please enter username and password', 'error');
            return false;
        }
        if (!username) {
            showToast('Please enter username', 'error');
            return false;
        }
        if (!password) {
            showToast('Please enter password', 'error');
            return false;
        }
        document.querySelector('form[action]').submit();
    }

    function showToast(msg, type) {
        var existing = document.getElementById('login-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.id = 'login-toast';
        toast.className = 'toast-notification toast-' + type;
        
        var icon = type === 'error' ? '&#10060;' : '&#9989;';
        toast.innerHTML = '<span class="toast-icon">' + icon + '</span>' +
                          '<span class="toast-msg">' + msg + '</span>' +
                          '<span class="toast-close" onclick="this.parentElement.remove()">&times;</span>';
        
        document.body.appendChild(toast);
        
        setTimeout(function() { toast.classList.add('toast-show'); }, 10);
        setTimeout(function() { 
            toast.classList.remove('toast-show');
            setTimeout(function() { toast.remove(); }, 300);
        }, 4000);
    }

    // Show server-side flash messages as toast on page load
    document.addEventListener('DOMContentLoaded', function() {
        <?php if($error_data) { ?>
            showToast('<?php echo urldecode($error_data); ?>', 'error');
        <?php } ?>
        <?php if($this->session->flashdata('error')) { ?>
            showToast('<?php echo addslashes($this->session->flashdata('error')); ?>', 'error');
        <?php } ?>
        <?php if($this->session->flashdata('success')) { ?>
            showToast('<?php echo addslashes($this->session->flashdata('success')); ?>', 'success');
        <?php } ?>
    });
</script>
<style>
    .input-icon-wrapper {
        position: relative;
        margin-bottom: 15px;
    }

    .input-icon-wrapper input {
        padding-left: 40px !important;  
    }

    .input-icon-wrapper .icon {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);  
        color: #888;
    }

    .input-icon-wrapper .toggle-password {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        cursor: pointer;
        color: #888;
    }

    /* Toast Notification */
    .toast-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 280px;
        max-width: 400px;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 99999;
        transform: translateX(120%);
        transition: transform 0.3s ease;
    }
    .toast-notification.toast-show {
        transform: translateX(0);
    }
    .toast-error {
        background: #dc3545;
    }
    .toast-success {
        background: #28a745;
    }
    .toast-icon {
        font-size: 18px;
        flex-shrink: 0;
    }
    .toast-msg {
        flex: 1;
    }
    .toast-close {
        font-size: 20px;
        cursor: pointer;
        opacity: 0.8;
        flex-shrink: 0;
        line-height: 1;
    }
    .toast-close:hover {
        opacity: 1;
    }
</style>
<?php
$no_visible_elements = true;
include('include/header.php');
 ?>

	<div class="app">
	<div class="bg"></div> 

	<?php 
		//Opening form
		echo form_open('C_main/login_validation'); 
	?> 
	<form class="form_login"> 
		<div class="login_head">
			<img src="<?php echo $this->config->item('base_url'); ?>assets/img/logo.png" class="img-responsive">
		</div>
		<div class="inputs">
			<div class="input-icon-wrapper">
				<i class="fa fa-user icon"></i>
				<input type="text" id="user_name" name="user_name" class="form-control" placeholder="Username" value="<?php if(isset($_COOKIE['rem_admin'])) { echo $_COOKIE['rem_admin']; } ?>" maxlength="30" oninput="this.value = this.value.replace(/\s/g, '')">
			</div>

			<div class="input-icon-wrapper">
				<i class="fa fa-lock icon"></i>
				<input type="password" name="user_password" id="user_password" class="form-control" placeholder="Password" value="<?php if(isset($_COOKIE['rem_admin'])) { echo $_COOKIE['admin_us']; } ?>" maxlength="30">
				<i class="fa fa-eye toggle-password" onclick="togglePassword()"></i>
			</div>
		</div>
	
	<div class="login_footer">
		 <label class="remember remember1" for="remember"><input type="checkbox" id="remember" name="remember" value="1"  <?php if(isset($_COOKIE['rem_admin'])) {
			echo 'checked="checked"';
		}
		else {
			echo '';
		}
		?> style="width: auto;"> Remember me</label>
		<button id="login" type="button" onclick="validateLogin()">Login</button>
	</div>
	</form>
</div>



<?php require('include/footer.php'); ?>