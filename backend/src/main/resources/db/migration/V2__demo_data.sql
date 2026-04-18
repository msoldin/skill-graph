insert into roadmaps (id, slug, title, description)
values (1, 'java-backend', 'Java Backend', 'Core backend concepts and tools for building practical Java services.');

insert into topics (id, slug, name, summary)
values
  (1, 'http-basics', 'HTTP Basics', 'Requests, responses, methods, and status codes.'),
  (2, 'rest-api-design', 'REST API Design', 'Resource naming, versioning, and practical API shape decisions.'),
  (3, 'sql-fundamentals', 'SQL Fundamentals', 'Data modeling, joins, and query tradeoffs for application developers.'),
  (4, 'java-http-clients', 'Java HTTP Clients', 'Calling downstream services from Java with sensible defaults.'),
  (5, 'quarkus-basics', 'Quarkus Basics', 'Quarkus structure, config, and delivery workflow.'),
  (6, 'testing-strategies', 'Testing Strategies', 'Layered backend testing that keeps feedback fast.');

insert into roadmap_topics (id, roadmap_id, topic_id, label_override, x, y, group_key, is_entrypoint)
values
  (101, 1, 1, null, 140, 120, 'foundations', true),
  (102, 1, 2, null, 470, 120, 'service-design', false),
  (103, 1, 3, null, null, null, 'data', false),
  (104, 1, 4, null, null, null, 'integration', false),
  (105, 1, 5, null, 800, 120, 'framework', false),
  (106, 1, 6, null, null, null, 'quality', false);

insert into roadmap_edges (id, roadmap_id, source_roadmap_topic_id, target_roadmap_topic_id, edge_type)
values
  (501, 1, 101, 102, 'prerequisite'),
  (502, 1, 101, 104, 'recommended'),
  (503, 1, 102, 105, 'prerequisite'),
  (504, 1, 103, 105, 'prerequisite'),
  (505, 1, 105, 106, 'recommended'),
  (506, 1, 102, 103, 'related');

insert into roadmap_topic_assets (id, roadmap_topic_id, asset_type, file_path, title, sort_order)
values
  (1001, 101, 'markdown', 'java-backend/http-basics/notes.md', 'HTTP Basics Notes', 0),
  (1002, 101, 'pdf', 'java-backend/http-basics/reference.pdf', 'HTTP Status Reference', 1),
  (1003, 102, 'markdown', 'java-backend/rest-api-design/notes.md', 'REST Design Checklist', 0),
  (1004, 103, 'markdown', 'java-backend/sql-fundamentals/notes.md', 'SQL Fundamentals Notes', 0),
  (1005, 104, 'markdown', 'java-backend/java-http-clients/notes.md', 'HTTP Client Notes', 0),
  (1006, 105, 'markdown', 'java-backend/quarkus-basics/notes.md', 'Quarkus Basics Notes', 0),
  (1007, 105, 'pdf', 'java-backend/quarkus-basics/cheatsheet.pdf', 'Quarkus Cheatsheet', 1),
  (1008, 106, 'markdown', 'java-backend/testing-strategies/notes.md', 'Testing Strategies Notes', 0);

select setval('roadmaps_id_seq', 1, true);
select setval('topics_id_seq', 6, true);
select setval('roadmap_topics_id_seq', 106, true);
select setval('roadmap_edges_id_seq', 506, true);
select setval('roadmap_topic_assets_id_seq', 1008, true);
