-- Insertar directorio de ventas y soporte en la tabla public.users
-- Nota: Estos registros crean perfiles visibles en el directorio.
-- No crean cuentas de autenticación en Supabase Auth.
-- Si necesitas login para estos usuarios, crea sus cuentas en Auth y
-- actualiza el id del perfil para que coincida con el id del usuario de Auth.

INSERT INTO public.users (
  email,
  empresa,
  nombre,
  apellido_paterno,
  apellido_materno,
  correo_electronico,
  celular,
  ciudad,
  estado,
  rol,
  categoria,
  zona,
  activo,
  is_online,
  last_seen,
  created_at,
  updated_at
) VALUES
  -- 1) Iván Pineda Ortega – Gerente comercial – Todo la República
  ('i.pineda@elmec.com.mx','ELMEC','Iván','Pineda','Ortega','i.pineda@elmec.com.mx','7711371306',NULL,'Todo la República','agent','Agentes de venta','NACIONAL',true,false,now(),now(),now()),

  -- 2) Carlos Rosales – Gerente regional zona Norte – Durango, Saltillo, Nuevo León, Tamaulipas
  ('c.rosales@elmec.com.mx','ELMEC','Carlos','Rosales','', 'c.rosales@elmec.com.mx','8711541155',NULL,'Durango, Saltillo, Nuevo León, Tamaulipas','agent','Agentes de venta','NORTE',true,false,now(),now(),now()),

  -- 3) Alex Díaz Zimbrón – Gerente regional zona Centro – Bajío
  ('alex.diaz@elmec.com.mx','ELMEC','Alex','Díaz','Zimbrón','alex.diaz@elmec.com.mx','4411137345',NULL,'Bajío','agent','Agentes de venta','CENTRO',true,false,now(),now(),now()),

  -- 4) Coco Vázquez – Agente de ventas – Querétaro, Guanajuato
  ('s.vazquez@elmec.com.mx','ELMEC','Coco','Vázquez','', 's.vazquez@elmec.com.mx','4721153564',NULL,'Querétaro, Guanajuato','agent','Agentes de venta','CENTRO',true,false,now(),now(),now()),

  -- 5) Oswaldo Salazar – Agente de ventas – Guanajuato, Aguascalientes, Jalisco
  ('o.salazar@elmec.com.mx','ELMEC','Oswaldo','Salazar','', 'o.salazar@elmec.com.mx','4721040546',NULL,'Guanajuato, Aguascalientes, Jalisco','agent','Agentes de venta','CENTRO',true,false,now(),now(),now()),

  -- 6) Gerardo Rosales Ríos – Agente de ventas – Monterrey
  ('g.rosales@elmec.com.mx','ELMEC','Gerardo','Rosales','Ríos','g.rosales@elmec.com.mx','8111191902','Monterrey','Nuevo León','agent','Agentes de venta','NORTE',true,false,now(),now(),now()),

  -- 7) Erick Navarrete – Agente de ventas – Querétaro
  ('e.navarrete@elmec.com.mx','ELMEC','Erick','Navarrete','', 'e.navarrete@elmec.com.mx','4422522908','Querétaro','Querétaro','agent','Agentes de venta','CENTRO',true,false,now(),now(),now()),

  -- 8) Oswaldo Peña – Agente de ventas – Puebla
  ('j.pena@elmec.com.mx','ELMEC','Oswaldo','Peña','', 'j.pena@elmec.com.mx','2223199479','Puebla','Puebla','agent','Agentes de venta','CENTRO',true,false,now(),now(),now()),

  -- 9) Luis Alfredo Salazar Castillo – Agente de ventas – Chihuahua
  ('a.salazar@elmec.com.mx','ELMEC','Luis Alfredo','Salazar','Castillo','a.salazar@elmec.com.mx','6142037025','Chihuahua','Chihuahua','agent','Agentes de venta','NORTE',true,false,now(),now(),now()),

  -- 10) Alberto Cano – Agente de ventas – Saltillo
  ('a.cano@elmec.com.mx','ELMEC','Alberto','Cano','', 'a.cano@elmec.com.mx','4422792340','Saltillo','Coahuila','agent','Agentes de venta','NORTE',true,false,now(),now(),now()),

  -- 11) Raymundo Larrea – Agente de ventas – Saltillo, Durango
  ('j.larrea@elmec.com.mx','ELMEC','Raymundo','Larrea','', 'j.larrea@elmec.com.mx','8715343492',NULL,'Saltillo, Durango','agent','Agentes de venta','NORTE',true,false,now(),now(),now()),

  -- 12) Alejandro Licona – Soporte Técnico zona Bajío – Guanajuato, Aguascalientes, Jalisco
  ('a.licona@elmec.com.mx','ELMEC','Alejandro','Licona','', 'a.licona@elmec.com.mx','4721238553',NULL,'Guanajuato, Aguascalientes, Jalisco','agent','Soporte','CENTRO',true,false,now(),now(),now()),

  -- 13) Rubén Martínez – Soporte Técnico/Ventas zona Centro – Toluca
  ('r.martinez@elmec.com.mx','ELMEC','Rubén','Martínez','', 'r.martinez@elmec.com.mx','7711349428','Toluca','Estado de México','agent','Soporte','CENTRO',true,false,now(),now(),now()),

  -- 14) Isabel Muñoz Anaya – Cotizaciones – Planta
  ('i.munoz@elmec.com.mx','ELMEC','Isabel','Muñoz','Anaya','i.munoz@elmec.com.mx','7712008105','Planta','Hidalgo','agent','Servicio al Cliente','Planta',true,false,now(),now(),now()),

  -- 15) Jocelyn González Molina – Atención al cliente – Planta
  ('j.gonzalez@elmec.com.mx','ELMEC','Jocelyn','González','Molina','j.gonzalez@elmec.com.mx','7712952386','Planta','Hidalgo','agent','Servicio al Cliente','Planta',true,false,now(),now(),now());

-- Verificación rápida
-- SELECT id, nombre, apellido_paterno, correo_electronico, zona, estado FROM public.users WHERE empresa = 'ELMEC' ORDER BY nombre;