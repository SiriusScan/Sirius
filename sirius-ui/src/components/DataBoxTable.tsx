interface TableProps {
  title: string;
  headers: string[];
  data: string[][];
  variant?: "ghost" | "default"; 
}

export const DataBoxTable: React.FC<TableProps> = ({
  title,
  headers,
  data,
  variant = "default",
}) => {
  
  const cssDressing = {
    default: "bg-paper mt-4 flex w-96 flex-col gap-4 rounded-md border-violet-700/10 p-4 shadow-md shadow-violet-300/10 dark:bg-violet-300/5",
    ghost: "mt-4 flex w-96 flex-col gap-4 rounded-md",
  }

  return (
  <>
    <div className={cssDressing[variant]}>
      <h2 className="text-2xl font-extralight">{title}</h2>
      <table className=" rounded-md bg-gray-800/20">
        <thead>
          <tr className="h-16 w-full border-b border-t-2 border-gray-300 dark:border-gray-600">
            {headers?.map((header) => (
              <th
                key={header}
                className="pr-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((service) => (
            <tr
              key={service[0]}
              className="h-14 border-b border-gray-300 dark:border-gray-600"
            >
              <td className="pr-4 text-sm text-gray-600 dark:text-gray-400">
                {service[0]}
              </td>
              <td className="pr-4 text-sm text-gray-600 dark:text-gray-400">
                {service[1]}
              </td>
              <td className="text-sm text-gray-600 dark:text-gray-400">
                {service[2]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
    
  );
};
