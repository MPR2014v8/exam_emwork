function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

async function processPayroll(empId, baseSalary, otHours) {
  const sso = roundMoney(baseSalary * 0.05);
  const otRate = roundMoney((baseSalary / 30 / 8) * 1.5);
  const gross = roundMoney(baseSalary + (otHours * otRate));
  const net = roundMoney(gross - sso);

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [employees] = await connection.execute(
      `SELECT emp_id
       FROM salaries
       WHERE emp_id = ?
       FOR UPDATE`,
      [empId]
    );

    if (employees.length === 0) {
      throw new Error("Employee not found");
    }

    /*
     * เช่น empId = "0 OR 1=1 -- "
     */
    await connection.execute(
      `UPDATE salaries
       SET balance = balance + ?
       WHERE emp_id = ?`,
      [net, empId]
    );

    await connection.commit();
    return net;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
