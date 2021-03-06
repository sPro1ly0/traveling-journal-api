CREATE TABLE traveling_journals (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    content TEXT NOT NULL,
    start_date TIMESTAMP DEFAULT now() NOT NULL,
    end_date TIMESTAMP DEFAULT now() NOT NULL,
    author_id INTEGER 
        REFERENCES traveling_users(id) ON DELETE CASCADE NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    date_modified TIMESTAMP
);