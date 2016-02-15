<?php
require_once("../gphoto-php/gPhoto.php");

$gphoto = new gPhoto();
$iso		= $gphoto->getISO();
$aperture	= $gphoto->getAperture();
$shutter	= $gphoto->getShutterSpeed();

$list = $gphoto->configList();

echo "<!-- ";
//print_r($iso);
print_r($list);


echo " -->";
?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Simple Sidebar - Start Bootstrap Template</title>

    <!-- Bootstrap Core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom CSS -->
    <link href="css/simple-sidebar.css" rel="stylesheet">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

</head>

<body>

    <div id="wrapper">

        <!-- Sidebar -->
        <div id="sidebar-wrapper">
            <ul class="sidebar-nav">
		<li class="sidebar-brand">
			<a href="#" class="">
				Menu
			</a>
		</li>
		<li>
			<a href="#">Photos</a>
		</li>
            </ul>
        </div>
        <!-- /#sidebar-wrapper -->

	<!-- Page Content -->
	<div id="page-content-wrapper">
		<div class="row">
			<a href="#menu-toggle" class="btn btn-default btn-lg glyphicon glyphicon-menu-hamburger" id="menu-toggle"></a>
		</div>
		<div class="container-fluid">
			<div class="row">
				<div class="col-lg-12">
					<h1>Take Picture</h1>
					<p>Current Settings</p>
					<table class="table table-striped">
						<thead>
							<tr>
								<th>Camera Setting</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><?php echo $iso->label; ?></td>
								<td><?php echo $iso->current; ?></td>
							</tr>
							<tr>
								<td><?php echo $aperture->label; ?></td>
								<td><?php echo $aperture->current; ?></td>
							</tr>
							<tr>
								<td><?php echo $shutter->label; ?></td>
								<td><?php echo $shutter->current; ?></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
	<!-- /#page-content-wrapper -->

    </div>
    <!-- /#wrapper -->

    <!-- jQuery -->
    <script src="js/jquery.js"></script>
    <script src="js/jquery.mobile-1.4.2.js"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="js/bootstrap.min.js"></script>

    <!-- Menu Toggle Script -->
    <script>
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
    </script>

</body>

</html>
