    CREATE TABLE ucsc_po_tracking
    (id serial, 
    submitted text, 
    fiscal_year text, 
    ames_po_number text, 
    date_pr_requested DATE, 
    date_needed DATE, 
    date_order_received DATE, 
    purchaser text, 
    requester text, 
    vendor text, 
    description text, 
    task_number text, 
    program text, 
    po_issued text, 
    po_date DATE, 
    po_number text, 
    cost text, 
    actual_cost text, 
    notes text, 
    PRIMARY KEY (id));

    CREATE TABLE purchaser
    (id serial, 
    first_name text, 
    last_name text, 
    PRIMARY KEY (id));

    CREATE TABLE vendor
    (id serial, 
    business_name text, 
    street_address text, 
    city text, 
    state text, 
    zipcode text, 
    phone text, 
    fax_number text, 
    contact_name text, 
    website text, 
    email text, 
    notes text, 
    PRIMARY KEY (id));