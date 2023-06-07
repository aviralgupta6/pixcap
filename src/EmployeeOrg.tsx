import React, { useEffect, useState } from "react";

interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;
}

const EmployeeOrgApp: React.FC<IEmployeeOrgApp> = ({ ceo }) => {
  const [history, setHistory] = useState<{ action: string; data: any }[]>([]);
  const [organization, setOrganization] = useState<Employee>(ceo);
  const [redoHistory, setRedoHistory] = useState<
    { action: string; data: any }[]
  >([]);
  const [moveElement, setMoveElement] = useState<any[]>([]);

  useEffect(() => {
    if (moveElement.length > 2) setMoveElement([]);
    else if (moveElement.length === 2 && moveElement[0] === moveElement[1])
      setMoveElement([]);
    else if (moveElement.length === 2) {
      move(moveElement[0], moveElement[1]);
      setMoveElement([]);
    }
  }, [moveElement]);
  const findEmployee = (
    employee: Employee,
    employeeID: number
  ): Employee | undefined => {
    if (employee.uniqueId === employeeID) {
      return employee;
    }
    for (const subordinate of employee.subordinates) {
      const foundEmployee = findEmployee(subordinate, employeeID);
      if (foundEmployee) {
        return foundEmployee;
      }
    }
    return undefined;
  };

  const findSupervisor = (
    employee: Employee,
    employeeID: number
  ): Employee | undefined => {
    for (const subordinate of employee.subordinates) {
      if (subordinate.uniqueId === employeeID) {
        return employee;
      }
      const foundSupervisor = findSupervisor(subordinate, employeeID);
      if (foundSupervisor) {
        return foundSupervisor;
      }
    }
    return undefined;
  };

  const move = (employeeID: number, supervisorID: number): void => {
    const employee = findEmployee(organization, employeeID);
    const supervisor = findEmployee(organization, supervisorID);

    if (employee && supervisor) {
      // Remove employee from their current supervisor
      const oldSupervisor = findSupervisor(organization, employeeID);
      if (oldSupervisor) {
        oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
          (subordinate) => subordinate.uniqueId !== employeeID
        );
      }

      // Move the subordinates of the employee back to their old supervisor
      const employeeSubordinates = employee.subordinates;
      const employeeSubordinatesIds: Array<number> = employeeSubordinates.map(
        ({ uniqueId }: { uniqueId: number }) => uniqueId
      );

      for (const subordinate of employeeSubordinates) {
        oldSupervisor?.subordinates.push(subordinate);
      }

      // Clear the subordinates of the moved employee
      employee.subordinates = [];
      // Add employee to the new supervisor
      supervisor.subordinates.push(employee);

      // Update history
      const newHistory = [
        ...history,
        {
          action: "move",
          data: {
            employeeID,
            supervisorID: oldSupervisor?.uniqueId,
            employeeSubordinatesIds,
          },
        },
      ];
      setHistory(newHistory);
      setRedoHistory([]);
      setOrganization({ ...organization });
    }
  };
  const undo = (): void => {
    if (history.length > 0) {
      const lastAction = history.pop();
      if (lastAction?.action === "move") {
        const { employeeID, supervisorID, employeeSubordinatesIds } =
          lastAction.data;

        const employee = findEmployee(organization, employeeID);
        const supervisor = findEmployee(organization, supervisorID);

        if (employee && supervisor) {
          // Remove employee from their current supervisor
          const oldSupervisor = findSupervisor(organization, employeeID);
          if (oldSupervisor) {
            oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
              (subordinate) => subordinate.uniqueId !== employeeID
            );
          }

          // Move the old subordinates of the employee back to the employee
          for (const subordinateId of employeeSubordinatesIds) {
            const subordinate = findEmployee(organization, subordinateId);
            if (subordinate) {
              employee.subordinates.push(subordinate);
            }
          }

          // Clear the subordinates of the supervisor
          supervisor.subordinates = supervisor.subordinates.filter(
            (subordinate) =>
              !employeeSubordinatesIds.includes(subordinate.uniqueId)
          );

          // Add employee back to their original supervisor
          supervisor.subordinates.push(employee);
          const redoAction = {
            action: "move",
            data: {
              employeeID,
              supervisorID: oldSupervisor?.uniqueId,
              employeeSubordinatesIds: [
                ...employee.subordinates.map((sub) => sub.uniqueId),
              ],
            },
          };

          setRedoHistory([...redoHistory, redoAction]);
          setOrganization({ ...organization });
        }
      }
    }
  };

  const redo = (): void => {
    if (redoHistory.length > 0) {
      const lastRedoAction = redoHistory.pop();
      if (lastRedoAction?.action === "move") {
        const { employeeID, supervisorID } = lastRedoAction.data;

        const employee = findEmployee(organization, employeeID);
        const supervisor = findEmployee(organization, supervisorID);
        if (employee && supervisor) {
          // Remove employee from their current supervisor
          const oldSupervisor = findSupervisor(organization, employeeID);
          if (oldSupervisor) {
            oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
              (subordinate) => subordinate.uniqueId !== employeeID
            );
          }

          // Move the subordinates of the employee to the employee's new supervisor
          const employeeSubordinates = employee.subordinates;
          const employeeSubordinatesIds: Array<number> =
            employeeSubordinates.map(
              ({ uniqueId }: { uniqueId: number }) => uniqueId
            );
          for (const subordinate of employeeSubordinates) {
            oldSupervisor?.subordinates.push(subordinate);
          }

          // Clear the subordinates of the employee
          employee.subordinates = [];

          // Add employee to the new supervisor
          supervisor.subordinates.push(employee);

          // Update history
          const newHistory = [
            ...history,
            {
              action: "move",
              data: {
                employeeID,
                supervisorID: oldSupervisor?.uniqueId,
                employeeSubordinatesIds,
              },
            },
          ];

          setHistory(newHistory);
          setRedoHistory([...redoHistory]);
          setOrganization({ ...organization });
        }
      }
    }
  };

  const renderSubordinates = (employee: Employee): JSX.Element => {
    if (employee.subordinates.length === 0) {
      return <></>;
    }

    return (
      <ul>
        {employee.subordinates.map((subordinate) => (
          <li
            key={subordinate.uniqueId}
            onClick={(e: React.MouseEvent<HTMLLIElement>) => {
              e.stopPropagation();
              setMoveElement([...moveElement, e.currentTarget.value]);
            }}
            value={subordinate.uniqueId}
            style={{ cursor: "pointer" }}
          >
            {subordinate.name}
            {renderSubordinates(subordinate)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h1>Employee Organization Chart</h1>

      <h2>CEO: {organization.name}</h2>

      {renderSubordinates(organization)}

      <div>
        <h3>Actions:</h3>
        <button onClick={() => move(5, 14)}>
          Move Bob Saget to Georgina Flangy
        </button>
        <button onClick={() => move(14, 2)}>
          Move Georgina Flangy to Sarah
        </button>

        <button onClick={undo} disabled={history.length === 0}>
          Undo
        </button>
        <button onClick={redo} disabled={redoHistory.length === 0}>
          Redo
        </button>
      </div>
      <h3>Note: </h3>
      <span>
        Organisational Chart is also movable on Click events, Click on the
        element first to pick it and on second click it will be moved to next
        supervisor
      </span>
    </div>
  );
};

export default EmployeeOrgApp;
