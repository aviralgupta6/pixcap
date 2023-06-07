import React from "react";
import EmployeeOrgApp from "./EmployeeOrg";

interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

const ceo: Employee = {
  uniqueId: 1,
  name: "Mark Zuckerberg",
  subordinates: [
    {
      uniqueId: 2,
      name: "Sarah Donald",
      subordinates: [
        {
          uniqueId: 3,
          name: "Cassandra Reynolds",
          subordinates: [
            {
              uniqueId: 4,
              name: "Mary Blue",
              subordinates: [],
            },
            {
              uniqueId: 5,
              name: "Bob Saget",
              subordinates: [
                {
                  uniqueId: 6,
                  name: "Tina Teff",
                  subordinates: [
                    {
                      uniqueId: 7,
                      name: "Will Turner",
                      subordinates: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      uniqueId: 8,
      name: "Tyler Simpson",
      subordinates: [
        {
          uniqueId: 9,
          name: "Harry Tobs",
          subordinates: [
            {
              uniqueId: 10,
              name: "Thomas Brown",
              subordinates: [],
            },
          ],
        },
        {
          uniqueId: 11,
          name: "George Carrey",
          subordinates: [],
        },
        {
          uniqueId: 12,
          name: "Gary Styles",
          subordinates: [],
        },
      ],
    },
    {
      uniqueId: 13,
      name: "Bruce Willis",
      subordinates: [],
    },
    {
      uniqueId: 14,
      name: "Georgina Flangy",
      subordinates: [
        {
          uniqueId: 15,
          name: "Sophie Turner",
          subordinates: [],
        },
      ],
    },
  ],
};

const App: React.FC = () => {
  return (
    <div>
      <EmployeeOrgApp ceo={ceo} />
    </div>
  );
};

export default App;
