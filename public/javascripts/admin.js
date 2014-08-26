  // If it worked, set the header so the address bar doesn't still say /adduser
  res.location("/");
  // And forward to success page
  res.redirect("/");