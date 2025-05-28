-- Link all games to the user with email 'rhyssaunders06@gmail.com'
UPDATE Game SET userId = (SELECT id FROM User WHERE email = 'rhyssaunders06@gmail.com');
