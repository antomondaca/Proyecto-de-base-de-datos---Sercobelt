-- Actualizacion NO destructiva. Ejecutar con Backend/aplicar_sql.py.
-- Cada bloque se compila por separado. No contiene DROP ni cambios de tablas.

CREATE OR REPLACE PROCEDURE INSERTAR_ROL (
    p_nombre_rol VARCHAR2
) 
AS
BEGIN
    INSERT INTO ROLES (ID_ROL, NOMBRE_ROL)
    VALUES (SEQ_ROL.NEXTVAL, p_nombre_rol);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_ROL).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_ROL).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_ROL: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_ROL (
    p_id_rol NUMBER,
    p_nombre_rol VARCHAR2
) 
AS
BEGIN
    UPDATE ROLES
    SET NOMBRE_ROL = p_nombre_rol
    WHERE ID_ROL = p_id_rol;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_ROL).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_ROL).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_ROL: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_ROL (
    p_id_rol NUMBER
) 
AS
BEGIN
    DELETE FROM ROLES
    WHERE ID_ROL = p_id_rol;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_ROL).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_ROL).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_ROL: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_ROL (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_ROL, NOMBRE_ROL
        FROM ROLES
        ORDER BY ID_ROL;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_ROL).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_ROL).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_ROL: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_PERSONAL (
    p_rut VARCHAR2,
    p_nombre VARCHAR2,
    p_cargo VARCHAR2,
    p_estado CHAR
) AS
BEGIN
    INSERT INTO PERSONALES (ID_PERSONAL, RUT, NOMBRE, CARGO, ESTADO)
    VALUES (SEQ_PERSONAL.NEXTVAL, p_rut, p_nombre, p_cargo, p_estado);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_PERSONAL).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_PERSONAL).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_PERSONAL: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_PERSONAL (
    p_id_personal NUMBER,
    p_rut VARCHAR2,
    p_nombre VARCHAR2,
    p_cargo VARCHAR2,
    p_estado CHAR
) 
AS
BEGIN
    UPDATE PERSONALES
    SET RUT = p_rut,
        NOMBRE = p_nombre,
        CARGO = p_cargo,
        ESTADO = p_estado
    WHERE ID_PERSONAL = p_id_personal;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_PERSONAL).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_PERSONAL).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_PERSONAL: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_PERSONAL (
    p_id_personal NUMBER
) 
AS
BEGIN
    DELETE FROM PERSONALES
    WHERE ID_PERSONAL = p_id_personal;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_PERSONAL).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_PERSONAL).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_PERSONAL: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_PERSONAL (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_PERSONAL, RUT, NOMBRE, CARGO,
               CASE ESTADO WHEN 'A' THEN 'Activo' ELSE 'Inactivo' END AS ESTADO
        FROM PERSONALES
        ORDER BY ID_PERSONAL;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_PERSONAL).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_PERSONAL).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_PERSONAL: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_CLIENTE (
    p_rut VARCHAR2,
    p_razon_social VARCHAR2,
    p_contacto VARCHAR2,
    p_email VARCHAR2,
    p_telefono VARCHAR2
) 
AS
BEGIN
    INSERT INTO CLIENTES (ID_CLIENTE, RUT, RAZON_SOCIAL, CONTACTO, EMAIL, TELEFONO)
    VALUES (SEQ_CLIENTE.NEXTVAL, p_rut, p_razon_social, p_contacto, p_email, p_telefono);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_CLIENTE).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_CLIENTE).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_CLIENTE: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_CLIENTE (
    p_id_cliente NUMBER,
    p_rut VARCHAR2,
    p_razon_social VARCHAR2,
    p_contacto VARCHAR2,
    p_email VARCHAR2,
    p_telefono VARCHAR2
) 
AS
BEGIN
    UPDATE CLIENTES
    SET RUT = p_rut,
        RAZON_SOCIAL = p_razon_social,
        CONTACTO = p_contacto,
        EMAIL = p_email,
        TELEFONO = p_telefono
    WHERE ID_CLIENTE = p_id_cliente;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_CLIENTE).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_CLIENTE).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_CLIENTE: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_CLIENTE (
    p_id_cliente NUMBER
) 
AS
BEGIN
    DELETE FROM CLIENTES
    WHERE ID_CLIENTE = p_id_cliente;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_CLIENTE).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_CLIENTE).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_CLIENTE: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_CLIENTE (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_CLIENTE, RUT, RAZON_SOCIAL, CONTACTO, EMAIL, TELEFONO
        FROM CLIENTES
        ORDER BY ID_CLIENTE;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_CLIENTE).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_CLIENTE).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_CLIENTE: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_PROVEEDOR (
    p_rut VARCHAR2,
    p_razon_social VARCHAR2,
    p_contacto VARCHAR2,
    p_telefono VARCHAR2
) 
AS
BEGIN
    INSERT INTO PROVEEDORES (ID_PROVEEDOR, RUT, RAZON_SOCIAL, CONTACTO, TELEFONO)
    VALUES (SEQ_PROVEEDOR.NEXTVAL, p_rut, p_razon_social, p_contacto, p_telefono);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_PROVEEDOR).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_PROVEEDOR).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_PROVEEDOR: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_PROVEEDOR (
    p_id_proveedor NUMBER,
    p_rut VARCHAR2,
    p_razon_social VARCHAR2,
    p_contacto VARCHAR2,
    p_telefono VARCHAR2
) 
AS
BEGIN
    UPDATE PROVEEDORES
    SET RUT = p_rut,
        RAZON_SOCIAL = p_razon_social,
        CONTACTO = p_contacto,
        TELEFONO = p_telefono
    WHERE ID_PROVEEDOR = p_id_proveedor;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_PROVEEDOR).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_PROVEEDOR).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_PROVEEDOR: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_PROVEEDOR (
    p_id_proveedor NUMBER
) 
AS
BEGIN
    DELETE FROM PROVEEDORES
    WHERE ID_PROVEEDOR = p_id_proveedor;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_PROVEEDOR).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_PROVEEDOR).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_PROVEEDOR: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_PROVEEDOR (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_PROVEEDOR, RUT, RAZON_SOCIAL, CONTACTO, TELEFONO
        FROM PROVEEDORES
        ORDER BY ID_PROVEEDOR;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_PROVEEDOR).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_PROVEEDOR).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_PROVEEDOR: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_VEHICULO (
    p_patente VARCHAR2,
    p_tipo VARCHAR2,
    p_estado CHAR
) 
AS
BEGIN
    INSERT INTO VEHICULOS (ID_VEHICULO, PATENTE, TIPO, ESTADO)
    VALUES (SEQ_VEHICULO.NEXTVAL, p_patente, p_tipo, p_estado);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_VEHICULO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_VEHICULO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_VEHICULO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_VEHICULO (
    p_id_vehiculo NUMBER,
    p_patente VARCHAR2,
    p_tipo VARCHAR2,
    p_estado CHAR
) 
AS
BEGIN
    UPDATE VEHICULOS
    SET PATENTE = p_patente,
        TIPO = p_tipo,
        ESTADO = p_estado
    WHERE ID_VEHICULO = p_id_vehiculo;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_VEHICULO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_VEHICULO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_VEHICULO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_VEHICULO (
    p_id_vehiculo NUMBER
) 
AS
BEGIN
    DELETE FROM VEHICULOS
    WHERE ID_VEHICULO = p_id_vehiculo;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_VEHICULO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_VEHICULO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_VEHICULO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_VEHICULO (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_VEHICULO, PATENTE, TIPO,
               CASE ESTADO WHEN 'A' THEN 'Activo' ELSE 'Inactivo' END AS ESTADO
        FROM VEHICULOS
        ORDER BY ID_VEHICULO;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_VEHICULO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_VEHICULO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_VEHICULO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_TIPO_TRABAJO (
    p_nombre VARCHAR2,
    p_descripcion VARCHAR2
) 
AS
BEGIN
    INSERT INTO TIPOS_TRABAJO (ID_TIPO_TRABAJO, NOMBRE, DESCRIPCION)
    VALUES (SEQ_TIPO_TRABAJO.NEXTVAL, p_nombre, p_descripcion);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_TIPO_TRABAJO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_TIPO_TRABAJO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_TIPO_TRABAJO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_TIPO_TRABAJO (
    p_id_tipo_trabajo NUMBER,
    p_nombre VARCHAR2,
    p_descripcion VARCHAR2
) 
AS
BEGIN
    UPDATE TIPOS_TRABAJO
    SET NOMBRE = p_nombre,
        DESCRIPCION = p_descripcion
    WHERE ID_TIPO_TRABAJO = p_id_tipo_trabajo;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_TIPO_TRABAJO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_TIPO_TRABAJO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_TIPO_TRABAJO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_TIPO_TRABAJO (
    p_id_tipo_trabajo NUMBER
) 
AS
BEGIN
    DELETE FROM TIPOS_TRABAJO
    WHERE ID_TIPO_TRABAJO = p_id_tipo_trabajo;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_TIPO_TRABAJO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_TIPO_TRABAJO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_TIPO_TRABAJO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_TIPO_TRABAJO (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_TIPO_TRABAJO, NOMBRE, DESCRIPCION
        FROM TIPOS_TRABAJO
        ORDER BY ID_TIPO_TRABAJO;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_TIPO_TRABAJO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_TIPO_TRABAJO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_TIPO_TRABAJO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_CATEGORIA_ITEM (
    p_nombre VARCHAR2,
    p_es_retornable CHAR
) 
AS
BEGIN
    INSERT INTO CATEGORIAS_ITEMS (ID_CATEGORIA, NOMBRE, ES_RETORNABLE)
    VALUES (SEQ_CATEGORIA_ITEM.NEXTVAL, p_nombre, p_es_retornable);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_CATEGORIA_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_CATEGORIA_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_CATEGORIA_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_CATEGORIA_ITEM (
    p_id_categoria NUMBER,
    p_nombre VARCHAR2,
    p_es_retornable CHAR
) 
AS
BEGIN
    UPDATE CATEGORIAS_ITEMS
    SET NOMBRE = p_nombre,
        ES_RETORNABLE = p_es_retornable
    WHERE ID_CATEGORIA = p_id_categoria;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_CATEGORIA_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_CATEGORIA_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_CATEGORIA_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_CATEGORIA_ITEM (
    p_id_categoria NUMBER
) 
AS
BEGIN
    DELETE FROM CATEGORIAS_ITEMS
    WHERE ID_CATEGORIA = p_id_categoria;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_CATEGORIA_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_CATEGORIA_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_CATEGORIA_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_CATEGORIA_ITEM (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_CATEGORIA, NOMBRE,
               CASE ES_RETORNABLE WHEN 'S' THEN 'Sí' ELSE 'No' END AS ES_RETORNABLE
        FROM CATEGORIAS_ITEMS
        ORDER BY ID_CATEGORIA;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_CATEGORIA_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_CATEGORIA_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_CATEGORIA_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_FAENA (
    p_id_cliente NUMBER,
    p_nombre VARCHAR2,
    p_ubicacion VARCHAR2
) 
AS
BEGIN
    INSERT INTO FAENAS (ID_FAENA, ID_CLIENTE, NOMBRE, UBICACION)
    VALUES (SEQ_FAENA.NEXTVAL, p_id_cliente, p_nombre, p_ubicacion);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_FAENA).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_FAENA).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_FAENA: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_FAENA (
    p_id_faena NUMBER,
    p_id_cliente NUMBER,
    p_nombre VARCHAR2,
    p_ubicacion VARCHAR2
) 
AS
BEGIN
    UPDATE FAENAS
    SET ID_CLIENTE = p_id_cliente,
        NOMBRE = p_nombre,
        UBICACION = p_ubicacion
    WHERE ID_FAENA = p_id_faena;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_FAENA).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_FAENA).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_FAENA: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_FAENA (
    p_id_faena NUMBER
) 
AS
BEGIN
    DELETE FROM FAENAS
    WHERE ID_FAENA = p_id_faena;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_FAENA).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_FAENA).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_FAENA: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_FAENA (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT f.ID_FAENA,
               f.ID_CLIENTE,
               c.RAZON_SOCIAL AS CLIENTE,
               f.NOMBRE,
               f.UBICACION
        FROM FAENAS f
        JOIN CLIENTES c ON f.ID_CLIENTE = c.ID_CLIENTE
        ORDER BY f.ID_FAENA;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_FAENA).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_FAENA).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_FAENA: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_ITEM (
    p_id_categoria NUMBER,
    p_nombre VARCHAR2,
    p_dimension VARCHAR2,
    p_unidad VARCHAR2,
    p_es_identificable CHAR
) 
AS
BEGIN
    INSERT INTO ITEMS (ID_ITEM, ID_CATEGORIA, NOMBRE, DIMENSION, UNIDAD, ES_IDENTIFICABLE)
    VALUES (SEQ_ITEM.NEXTVAL, p_id_categoria, p_nombre, p_dimension, p_unidad, p_es_identificable);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_ITEM (
    p_id_item NUMBER,
    p_id_categoria NUMBER,
    p_nombre VARCHAR2,
    p_dimension VARCHAR2,
    p_unidad VARCHAR2,
    p_es_identificable CHAR
) 
AS
BEGIN
    UPDATE ITEMS
    SET ID_CATEGORIA = p_id_categoria,
        NOMBRE = p_nombre,
        DIMENSION = p_dimension,
        UNIDAD = p_unidad,
        ES_IDENTIFICABLE = p_es_identificable
    WHERE ID_ITEM = p_id_item;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_ITEM (
    p_id_item NUMBER
) 
AS
BEGIN
    DELETE FROM ITEMS
    WHERE ID_ITEM = p_id_item;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_ITEM (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT i.ID_ITEM,
               i.ID_CATEGORIA,
               c.NOMBRE AS CATEGORIA,
               i.NOMBRE,
               i.DIMENSION,
               i.UNIDAD,
               CASE i.ES_IDENTIFICABLE WHEN 'S' THEN 'Sí' ELSE 'No' END AS ES_IDENTIFICABLE
        FROM ITEMS i
        JOIN CATEGORIAS_ITEMS c ON i.ID_CATEGORIA = c.ID_CATEGORIA
        ORDER BY i.ID_ITEM;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_UNIDAD_EQUIPO (
    p_id_item NUMBER,
    p_codigo VARCHAR2,
    p_nro_serie VARCHAR2,
    p_estado VARCHAR2,
    p_fecha_proxima_calibracion DATE
) 
AS
BEGIN
    INSERT INTO UNIDADES_EQUIPOS (ID_UNIDAD, ID_ITEM, CODIGO, NRO_SERIE, ESTADO, FECHA_PROXIMA_CALIBRACION)
    VALUES (SEQ_UNIDAD_EQUIPO.NEXTVAL, p_id_item, p_codigo, p_nro_serie, p_estado, p_fecha_proxima_calibracion);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_UNIDAD_EQUIPO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_UNIDAD_EQUIPO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_UNIDAD_EQUIPO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_UNIDAD_EQUIPO (
    p_id_unidad NUMBER,
    p_id_item NUMBER,
    p_codigo VARCHAR2,
    p_nro_serie VARCHAR2,
    p_estado VARCHAR2,
    p_fecha_proxima_calibracion DATE
) 
AS
BEGIN
    UPDATE UNIDADES_EQUIPOS
    SET ID_ITEM = p_id_item,
        CODIGO = p_codigo,
        NRO_SERIE = p_nro_serie,
        ESTADO = p_estado,
        FECHA_PROXIMA_CALIBRACION = p_fecha_proxima_calibracion
    WHERE ID_UNIDAD = p_id_unidad;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_UNIDAD_EQUIPO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_UNIDAD_EQUIPO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_UNIDAD_EQUIPO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_UNIDAD_EQUIPO (
    p_id_unidad NUMBER
) 
AS
BEGIN
    DELETE FROM UNIDADES_EQUIPOS
    WHERE ID_UNIDAD = p_id_unidad;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_UNIDAD_EQUIPO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_UNIDAD_EQUIPO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_UNIDAD_EQUIPO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_UNIDAD_EQUIPO (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT u.ID_UNIDAD,
               u.ID_ITEM,
               i.NOMBRE AS ITEM,
               u.CODIGO,
               u.NRO_SERIE,
               u.ESTADO,
               u.FECHA_PROXIMA_CALIBRACION
        FROM UNIDADES_EQUIPOS u
        JOIN ITEMS i ON u.ID_ITEM = i.ID_ITEM
        ORDER BY u.ID_UNIDAD;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_UNIDAD_EQUIPO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_UNIDAD_EQUIPO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_UNIDAD_EQUIPO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_USUARIO (
    p_id_rol NUMBER,
    p_id_personal NUMBER,
    p_username VARCHAR2,
    p_password_hash VARCHAR2,
    p_estado CHAR
) 
AS
BEGIN
    INSERT INTO USUARIOS (ID_USUARIO, ID_ROL, ID_PERSONAL, USERNAME, PASSWORD_HASH, ESTADO)
    VALUES (SEQ_USUARIO.NEXTVAL, p_id_rol, p_id_personal, p_username, p_password_hash, p_estado);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_USUARIO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_USUARIO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_USUARIO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_USUARIO (
    p_id_usuario NUMBER,
    p_id_rol NUMBER,
    p_id_personal NUMBER,
    p_username VARCHAR2,
    p_password_hash VARCHAR2,
    p_estado CHAR
) 
AS
BEGIN
    UPDATE USUARIOS
    SET ID_ROL = p_id_rol,
        ID_PERSONAL = p_id_personal,
        USERNAME = p_username,
        PASSWORD_HASH = NVL(p_password_hash, PASSWORD_HASH),
        ESTADO = p_estado
    WHERE ID_USUARIO = p_id_usuario;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_USUARIO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_USUARIO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_USUARIO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_USUARIO (
    p_id_usuario NUMBER
) 
AS
BEGIN
    DELETE FROM USUARIOS
    WHERE ID_USUARIO = p_id_usuario;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_USUARIO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_USUARIO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_USUARIO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_USUARIO (
    p_cursor OUT SYS_REFCURSOR
) 
AS
BEGIN
    OPEN p_cursor FOR
        SELECT u.ID_USUARIO,
               u.ID_ROL,
               r.NOMBRE_ROL AS ROL,
               u.ID_PERSONAL,
               p.NOMBRE AS PERSONAL,
               u.USERNAME,
               CASE u.ESTADO WHEN 'A' THEN 'Activo' ELSE 'Inactivo' END AS ESTADO
        FROM USUARIOS u
        JOIN ROLES r ON u.ID_ROL = r.ID_ROL
        LEFT JOIN PERSONALES p ON u.ID_PERSONAL = p.ID_PERSONAL
        ORDER BY u.ID_USUARIO;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_USUARIO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_USUARIO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_USUARIO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE SP_LOGIN (
    p_username VARCHAR2,
    p_password_hash VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT u.ID_USUARIO,
               u.USERNAME,
               r.ID_ROL,
               r.NOMBRE_ROL AS ROL,
               p.ID_PERSONAL,
               p.NOMBRE AS NOMBRE_PERSONA
        FROM USUARIOS u
        JOIN ROLES r ON u.ID_ROL = r.ID_ROL
        LEFT JOIN PERSONALES p ON u.ID_PERSONAL = p.ID_PERSONAL
        WHERE u.USERNAME = p_username
          AND u.PASSWORD_HASH = p_password_hash
          AND u.ESTADO = 'A';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (SP_LOGIN).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (SP_LOGIN).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en SP_LOGIN: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE FUNCTION FN_POR_DESPACHAR (
    p_id_detalle NUMBER
) RETURN NUMBER AS
    v_pendiente NUMBER;
BEGIN
    SELECT NVL(CANTIDAD_REQUERIDA, 0) - NVL(CANTIDAD_DESPACHADA, 0)
    INTO v_pendiente
    FROM DETALLES_CHECKLIST
    WHERE ID_DETALLE = p_id_detalle;

    RETURN v_pendiente;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (FN_POR_DESPACHAR).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (FN_POR_DESPACHAR).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en FN_POR_DESPACHAR: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE FUNCTION FN_NO_RETORNADO (
    p_id_detalle NUMBER
) RETURN NUMBER AS
    v_no_retornado NUMBER;
    v_es_retornable CHAR(1);
BEGIN
    SELECT c.ES_RETORNABLE,
           NVL(d.CANTIDAD_DESPACHADA, 0) - NVL(d.CANTIDAD_RETORNADA, 0)
    INTO v_es_retornable, v_no_retornado
    FROM DETALLES_CHECKLIST d
    JOIN ITEMS i ON d.ID_ITEM = i.ID_ITEM
    JOIN CATEGORIAS_ITEMS c ON i.ID_CATEGORIA = c.ID_CATEGORIA
    WHERE d.ID_DETALLE = p_id_detalle;

    IF v_es_retornable = 'S' THEN
        RETURN v_no_retornado;
    ELSE
        RETURN 0;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (FN_NO_RETORNADO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (FN_NO_RETORNADO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en FN_NO_RETORNADO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE CREAR_OT_CON_CHECKLIST (
    p_id_faena NUMBER,
    p_id_tipo_trabajo NUMBER,
    p_id_vehiculo NUMBER,
    p_id_supervisor NUMBER,
    p_id_maestro NUMBER,
    p_nro_ot VARCHAR2,
    p_fecha_retorno_prevista DATE
) AS
    v_id_ot NUMBER;
    v_id_item NUMBER;
    v_cant_estandar NUMBER(8, 2);

    CURSOR c_plantilla IS
        SELECT ID_ITEM, CANTIDAD_ESTANDAR
        FROM PLANTILLAS_ITEMS
        WHERE ID_TIPO_TRABAJO = p_id_tipo_trabajo;
BEGIN
    v_id_ot := SEQ_ORDEN_TRABAJO.NEXTVAL;
    INSERT INTO ORDENES_TRABAJO (
        ID_OT, ID_FAENA, ID_TIPO_TRABAJO, ID_VEHICULO,
        ID_SUPERVISOR, ID_MAESTRO, NRO_OT,
        FECHA_SALIDA, FECHA_RETORNO_PREVISTA, ESTADO
    ) VALUES (
        v_id_ot, p_id_faena, p_id_tipo_trabajo, p_id_vehiculo,
        p_id_supervisor, p_id_maestro, p_nro_ot,
        SYSDATE, p_fecha_retorno_prevista, 'Borrador'
    );
    OPEN c_plantilla;
    LOOP
        FETCH c_plantilla INTO v_id_item, v_cant_estandar;
        EXIT WHEN c_plantilla%NOTFOUND;

        INSERT INTO DETALLES_CHECKLIST (
            ID_DETALLE, ID_OT, ID_ITEM, ID_UNIDAD,
            CANTIDAD_REQUERIDA, CANTIDAD_DESPACHADA, CANTIDAD_RETORNADA,
            ESTADO_ITEM, VERIFICADO
        ) VALUES (
            SEQ_CHECKLIST_DETALLE.NEXTVAL, v_id_ot, v_id_item, NULL,
            v_cant_estandar, 0, 0,
            'Pendiente', 'N'
        );
    END LOOP;
    CLOSE c_plantilla;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        IF c_plantilla%ISOPEN THEN CLOSE c_plantilla; END IF;
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (CREAR_OT_CON_CHECKLIST).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (CREAR_OT_CON_CHECKLIST).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en CREAR_OT_CON_CHECKLIST: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE VERIFICAR_DESPACHAR_ITEM (
    p_id_detalle NUMBER,
    p_id_unidad NUMBER,
    p_cantidad_despachada NUMBER,
    p_observacion VARCHAR2
) AS
    v_cant_requerida NUMBER(8, 2);
    v_estado_item VARCHAR2(20);
BEGIN
    SELECT CANTIDAD_REQUERIDA
    INTO v_cant_requerida
    FROM DETALLES_CHECKLIST
    WHERE ID_DETALLE = p_id_detalle;

    IF p_cantidad_despachada >= v_cant_requerida THEN
        v_estado_item := 'Despachado';
    ELSE
        v_estado_item := 'Faltante';
    END IF;

    UPDATE DETALLES_CHECKLIST
    SET ID_UNIDAD = p_id_unidad,
        CANTIDAD_DESPACHADA = p_cantidad_despachada,
        ESTADO_ITEM = v_estado_item,
        OBSERVACION = p_observacion,
        VERIFICADO = 'S',
        FECHA_VERIFICACION = SYSDATE
    WHERE ID_DETALLE = p_id_detalle;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (VERIFICAR_DESPACHAR_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (VERIFICAR_DESPACHAR_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en VERIFICAR_DESPACHAR_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE CONFIRMAR_SALIDA_OT (
    p_id_ot NUMBER
) AS
    v_sin_verificar NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_sin_verificar
    FROM DETALLES_CHECKLIST
    WHERE ID_OT = p_id_ot
      AND VERIFICADO = 'N';

    IF v_sin_verificar > 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'No se puede confirmar la salida: aún existen ítems sin verificar.');
    END IF;

    UPDATE ORDENES_TRABAJO
    SET ESTADO = 'En terreno',
        FECHA_SALIDA = SYSDATE
    WHERE ID_OT = p_id_ot;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (CONFIRMAR_SALIDA_OT).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (CONFIRMAR_SALIDA_OT).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en CONFIRMAR_SALIDA_OT: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE REGISTRAR_RETORNO_ITEM (
    p_id_detalle NUMBER,
    p_cantidad_retornada NUMBER,
    p_observacion VARCHAR2
) AS
    v_despachada NUMBER(8, 2);
    v_es_retornable CHAR(1);
    v_estado VARCHAR2(20);
BEGIN
    SELECT d.CANTIDAD_DESPACHADA, c.ES_RETORNABLE
    INTO v_despachada, v_es_retornable
    FROM DETALLES_CHECKLIST d
    JOIN ITEMS i ON d.ID_ITEM = i.ID_ITEM
    JOIN CATEGORIAS_ITEMS c ON i.ID_CATEGORIA = c.ID_CATEGORIA
    WHERE d.ID_DETALLE = p_id_detalle;

    IF v_es_retornable = 'N' THEN
        v_estado := 'Consumido';
    ELSIF p_cantidad_retornada >= v_despachada THEN
        v_estado := 'Retornado';
    ELSE
        v_estado := 'Faltante';
    END IF;

    UPDATE DETALLES_CHECKLIST
    SET CANTIDAD_RETORNADA = p_cantidad_retornada,
        ESTADO_ITEM = v_estado,
        OBSERVACION = p_observacion
    WHERE ID_DETALLE = p_id_detalle;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (REGISTRAR_RETORNO_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (REGISTRAR_RETORNO_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en REGISTRAR_RETORNO_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE CERRAR_ORDEN_TRABAJO (
    p_id_ot NUMBER
) AS
    v_id_detalle NUMBER;

    CURSOR c_consumibles IS
        SELECT d.ID_DETALLE
        FROM DETALLES_CHECKLIST d
        JOIN ITEMS i ON d.ID_ITEM = i.ID_ITEM
        JOIN CATEGORIAS_ITEMS c ON i.ID_CATEGORIA = c.ID_CATEGORIA
        WHERE d.ID_OT = p_id_ot
          AND c.ES_RETORNABLE = 'N';
BEGIN
    OPEN c_consumibles;
    LOOP
        FETCH c_consumibles INTO v_id_detalle;
        EXIT WHEN c_consumibles%NOTFOUND;

        UPDATE DETALLES_CHECKLIST
        SET ESTADO_ITEM = 'Consumido'
        WHERE ID_DETALLE = v_id_detalle;
    END LOOP;
    CLOSE c_consumibles;

    UPDATE ORDENES_TRABAJO
    SET ESTADO = 'Cerrada',
        FECHA_RETORNO = SYSDATE
    WHERE ID_OT = p_id_ot;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        IF c_consumibles%ISOPEN THEN CLOSE c_consumibles; END IF;
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (CERRAR_ORDEN_TRABAJO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (CERRAR_ORDEN_TRABAJO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en CERRAR_ORDEN_TRABAJO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE REGISTRAR_MANTENCION (
    p_id_unidad NUMBER,
    p_tipo VARCHAR2,
    p_fecha_proxima DATE,
    p_observacion VARCHAR2,
    p_estado_equipo VARCHAR2
) AS
BEGIN
    INSERT INTO MANTENCIONES (
        ID_MANTENCION, ID_UNIDAD, TIPO, FECHA, FECHA_PROXIMA, OBSERVACION
    ) VALUES (
        SEQ_MANTENCION.NEXTVAL, p_id_unidad, p_tipo, SYSDATE, p_fecha_proxima, p_observacion
    );

    UPDATE UNIDADES_EQUIPOS
    SET ESTADO = p_estado_equipo,
        FECHA_PROXIMA_CALIBRACION = NVL(p_fecha_proxima, FECHA_PROXIMA_CALIBRACION)
    WHERE ID_UNIDAD = p_id_unidad;

    IF p_estado_equipo = 'En bodega' THEN
        UPDATE ALERTAS
        SET ATENDIDA = 'S'
        WHERE ID_UNIDAD = p_id_unidad
          AND ATENDIDA = 'N';
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (REGISTRAR_MANTENCION).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (REGISTRAR_MANTENCION).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en REGISTRAR_MANTENCION: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE GENERAR_REQ_COMPRA (
    p_id_detalle NUMBER,
    p_id_proveedor NUMBER
) AS
    v_faltante NUMBER(8, 2);
BEGIN
    v_faltante := FN_POR_DESPACHAR(p_id_detalle) + FN_NO_RETORNADO(p_id_detalle);

    IF v_faltante > 0 THEN
        INSERT INTO REQUERIMIENTOS_COMPRA (
            ID_REQUERIMIENTO, ID_DETALLE, ID_PROVEEDOR, CANTIDAD, ESTADO, FECHA
        ) VALUES (
            SEQ_REQ_COMPRA.NEXTVAL, p_id_detalle, p_id_proveedor, v_faltante, 'Solicitado', SYSDATE
        );
        COMMIT;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (GENERAR_REQ_COMPRA).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (GENERAR_REQ_COMPRA).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en GENERAR_REQ_COMPRA: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_ESTADO_COMPRA (
    p_id_requerimiento NUMBER,
    p_estado VARCHAR2
) AS
BEGIN
    UPDATE REQUERIMIENTOS_COMPRA
    SET ESTADO = p_estado
    WHERE ID_REQUERIMIENTO = p_id_requerimiento;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_ESTADO_COMPRA).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_ESTADO_COMPRA).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_ESTADO_COMPRA: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE REPORTE_FUERA_BODEGA (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT cl.RAZON_SOCIAL AS CLIENTE,
               f.NOMBRE AS FAENA,
               ot.NRO_OT,
               ot.ESTADO AS ESTADO_OT,
               ot.FECHA_SALIDA,
               ot.FECHA_RETORNO_PREVISTA,
               i.NOMBRE AS ITEM,
               u.CODIGO AS CODIGO_EQUIPO,
               u.NRO_SERIE,
               d.CANTIDAD_DESPACHADA,
               FN_NO_RETORNADO(d.ID_DETALLE) AS CANTIDAD_FUERA
        FROM ORDENES_TRABAJO ot
        JOIN FAENAS f ON ot.ID_FAENA = f.ID_FAENA
        JOIN CLIENTES cl ON f.ID_CLIENTE = cl.ID_CLIENTE
        JOIN DETALLES_CHECKLIST d ON ot.ID_OT = d.ID_OT
        JOIN ITEMS i ON d.ID_ITEM = i.ID_ITEM
        LEFT JOIN UNIDADES_EQUIPOS u ON d.ID_UNIDAD = u.ID_UNIDAD
        WHERE FN_NO_RETORNADO(d.ID_DETALLE) > 0
        ORDER BY ot.FECHA_SALIDA, ot.NRO_OT;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (REPORTE_FUERA_BODEGA).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (REPORTE_FUERA_BODEGA).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en REPORTE_FUERA_BODEGA: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE REPORTE_PENDIENTES_FALTANTES (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT ot.NRO_OT,
               i.NOMBRE AS ITEM,
               i.UNIDAD,
               FN_POR_DESPACHAR(d.ID_DETALLE) AS POR_DESPACHAR,
               FN_NO_RETORNADO(d.ID_DETALLE) AS NO_RETORNADO,
               rc.CANTIDAD AS CANTIDAD_COMPRA,
               rc.ESTADO AS ESTADO_COMPRA,
               p.RAZON_SOCIAL AS PROVEEDOR
        FROM DETALLES_CHECKLIST d
        JOIN ORDENES_TRABAJO ot ON d.ID_OT = ot.ID_OT
        JOIN ITEMS i ON d.ID_ITEM = i.ID_ITEM
        LEFT JOIN REQUERIMIENTOS_COMPRA rc ON d.ID_DETALLE = rc.ID_DETALLE
        LEFT JOIN PROVEEDORES p ON rc.ID_PROVEEDOR = p.ID_PROVEEDOR
        WHERE FN_POR_DESPACHAR(d.ID_DETALLE) > 0
           OR FN_NO_RETORNADO(d.ID_DETALLE) > 0
           OR rc.ESTADO IN ('Solicitado', 'Comprado')
        ORDER BY ot.NRO_OT, i.NOMBRE;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (REPORTE_PENDIENTES_FALTANTES).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (REPORTE_PENDIENTES_FALTANTES).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en REPORTE_PENDIENTES_FALTANTES: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE REPORTE_CONSUMO_MENSUAL (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT TO_CHAR(ot.FECHA_SALIDA, 'YYYY-MM') AS MES,
               cl.RAZON_SOCIAL AS CLIENTE,
               ot.NRO_OT,
               c.NOMBRE AS CATEGORIA,
               i.NOMBRE AS ITEM,
               i.UNIDAD,
               SUM(NVL(d.CANTIDAD_DESPACHADA, 0)) AS TOTAL_CONSUMIDO
        FROM DETALLES_CHECKLIST d
        JOIN ITEMS i ON d.ID_ITEM = i.ID_ITEM
        JOIN CATEGORIAS_ITEMS c ON i.ID_CATEGORIA = c.ID_CATEGORIA
        JOIN ORDENES_TRABAJO ot ON d.ID_OT = ot.ID_OT
        JOIN FAENAS f ON ot.ID_FAENA = f.ID_FAENA
        JOIN CLIENTES cl ON f.ID_CLIENTE = cl.ID_CLIENTE
        WHERE c.ES_RETORNABLE = 'N'
          AND d.ESTADO_ITEM = 'Consumido'
        GROUP BY TO_CHAR(ot.FECHA_SALIDA, 'YYYY-MM'),
                 cl.RAZON_SOCIAL,
                 ot.NRO_OT,
                 c.NOMBRE,
                 i.NOMBRE,
                 i.UNIDAD
        ORDER BY MES DESC, cl.RAZON_SOCIAL, ot.NRO_OT;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (REPORTE_CONSUMO_MENSUAL).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (REPORTE_CONSUMO_MENSUAL).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en REPORTE_CONSUMO_MENSUAL: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_ALERTAS (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT a.ID_ALERTA, a.ID_OT, ot.NRO_OT, a.ID_UNIDAD, u.CODIGO AS CODIGO_EQUIPO,
               a.TIPO, a.MENSAJE, a.FECHA, a.ATENDIDA
        FROM ALERTAS a
        LEFT JOIN ORDENES_TRABAJO ot ON a.ID_OT = ot.ID_OT
        LEFT JOIN UNIDADES_EQUIPOS u ON a.ID_UNIDAD = u.ID_UNIDAD
        ORDER BY a.ATENDIDA ASC, a.FECHA DESC;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_ALERTAS).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_ALERTAS).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_ALERTAS: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ATENDER_ALERTA (
    p_id_alerta NUMBER
) AS
BEGIN
    UPDATE ALERTAS SET ATENDIDA = 'S' WHERE ID_ALERTA = p_id_alerta;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ATENDER_ALERTA).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ATENDER_ALERTA).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ATENDER_ALERTA: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_BITACORAS (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_BITACORA, TABLA, OPERACION, ID_REGISTRO,
               VALOR_ANTERIOR, VALOR_NUEVO, USUARIO_BD, FECHA, ID_USUARIO
        FROM BITACORAS
        ORDER BY FECHA DESC;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_BITACORAS).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_BITACORAS).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_BITACORAS: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE INSERTAR_PLANTILLA_ITEM (
    p_id_tipo_trabajo NUMBER,
    p_id_item NUMBER,
    p_cantidad_estandar NUMBER
) AS
BEGIN
    INSERT INTO PLANTILLAS_ITEMS (ID_TIPO_TRABAJO, ID_ITEM, CANTIDAD_ESTANDAR)
    VALUES (p_id_tipo_trabajo, p_id_item, p_cantidad_estandar);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (INSERTAR_PLANTILLA_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (INSERTAR_PLANTILLA_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en INSERTAR_PLANTILLA_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ACTUALIZAR_PLANTILLA_ITEM (
    p_id_tipo_trabajo NUMBER,
    p_id_item NUMBER,
    p_cantidad_estandar NUMBER
) AS
BEGIN
    UPDATE PLANTILLAS_ITEMS
    SET CANTIDAD_ESTANDAR = p_cantidad_estandar
    WHERE ID_TIPO_TRABAJO = p_id_tipo_trabajo AND ID_ITEM = p_id_item;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ACTUALIZAR_PLANTILLA_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ACTUALIZAR_PLANTILLA_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ACTUALIZAR_PLANTILLA_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE ELIMINAR_PLANTILLA_ITEM (
    p_id_tipo_trabajo NUMBER,
    p_id_item NUMBER
) AS
BEGIN
    DELETE FROM PLANTILLAS_ITEMS
    WHERE ID_TIPO_TRABAJO = p_id_tipo_trabajo AND ID_ITEM = p_id_item;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (ELIMINAR_PLANTILLA_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (ELIMINAR_PLANTILLA_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en ELIMINAR_PLANTILLA_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_PLANTILLA_ITEM (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_TIPO_TRABAJO, ID_ITEM, CANTIDAD_ESTANDAR
        FROM PLANTILLAS_ITEMS
        ORDER BY ID_TIPO_TRABAJO, ID_ITEM;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_PLANTILLA_ITEM).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_PLANTILLA_ITEM).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_PLANTILLA_ITEM: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_ORDEN_TRABAJO (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_OT, ID_FAENA, ID_TIPO_TRABAJO, ID_VEHICULO, ID_SUPERVISOR, ID_MAESTRO,
               NRO_OT, FECHA_SALIDA, FECHA_RETORNO_PREVISTA, FECHA_RETORNO, ESTADO
        FROM ORDENES_TRABAJO
        ORDER BY ID_OT;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_ORDEN_TRABAJO).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_ORDEN_TRABAJO).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_ORDEN_TRABAJO: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_DETALLE_CHECKLIST (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_DETALLE, ID_OT, ID_ITEM, ID_UNIDAD, CANTIDAD_REQUERIDA, CANTIDAD_DESPACHADA,
               CANTIDAD_RETORNADA, ESTADO_ITEM, OBSERVACION, VERIFICADO, FECHA_VERIFICACION,
               FN_POR_DESPACHAR(ID_DETALLE) AS POR_DESPACHAR,
               FN_NO_RETORNADO(ID_DETALLE) AS NO_RETORNADO,
               FN_POR_DESPACHAR(ID_DETALLE) + FN_NO_RETORNADO(ID_DETALLE) AS CANTIDAD_COMPRA
        FROM DETALLES_CHECKLIST
        ORDER BY ID_DETALLE;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_DETALLE_CHECKLIST).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_DETALLE_CHECKLIST).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_DETALLE_CHECKLIST: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_MANTENCION (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_MANTENCION, ID_UNIDAD, TIPO, FECHA, FECHA_PROXIMA, OBSERVACION
        FROM MANTENCIONES
        ORDER BY ID_MANTENCION;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_MANTENCION).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_MANTENCION).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_MANTENCION: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE LISTAR_REQ_COMPRA (
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT ID_REQUERIMIENTO, ID_DETALLE, ID_PROVEEDOR, CANTIDAD, ESTADO, FECHA
        FROM REQUERIMIENTOS_COMPRA
        ORDER BY ID_REQUERIMIENTO;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSIF SQLCODE = -1 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Registro duplicado (LISTAR_REQ_COMPRA).', TRUE);
        ELSIF SQLCODE = -2292 THEN
            RAISE_APPLICATION_ERROR(-20011, 'No se puede eliminar o modificar: existen registros asociados.', TRUE);
        ELSIF SQLCODE = -2291 THEN
            RAISE_APPLICATION_ERROR(-20012, 'La referencia seleccionada no existe.', TRUE);
        ELSIF SQLCODE = 100 THEN
            RAISE_APPLICATION_ERROR(-20013, 'Registro no encontrado (LISTAR_REQ_COMPRA).', TRUE);
        ELSE
            RAISE_APPLICATION_ERROR(-20014, SUBSTR('Error en LISTAR_REQ_COMPRA: ' || SQLERRM, 1, 500), TRUE);
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE OBTENER_CREDENCIAL (
    p_username IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT u.ID_USUARIO, u.USERNAME, u.ID_ROL, r.NOMBRE_ROL AS ROL,
               u.ID_PERSONAL, p.NOMBRE AS NOMBRE_PERSONA, u.PASSWORD_HASH
        FROM USUARIOS u
        JOIN ROLES r ON u.ID_ROL = r.ID_ROL
        LEFT JOIN PERSONALES p ON u.ID_PERSONAL = p.ID_PERSONAL
        WHERE u.USERNAME = p_username AND u.ESTADO = 'A';
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20014, 'Error consultando credenciales.', TRUE);
END;
/
