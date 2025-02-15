interface SeverityBadgeProps {
  severity: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  // console.log("SeverityBadge: severity: ", severity);
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-700";
      case "high":
        return "bg-orange-700";
      case "medium":
        return "bg-yellow-700";
      case "low":
        return "bg-green-700";
      case "informational":
        return "bg-blue-700";
      default:
        return "bg-gray-700";
    }
  };
  //Force add tailwind styles (nextjs + tailwind won't automatically add style classes that are generated dynamically)
  //bg-red-200 dark:bg-red-700 bg-orange-200 dark:bg-orange-700 bg-yellow-200 dark:bg-yellow-700 bg-green-200 dark:bg-green-700 bg-blue-200 dark:bg-blue-700
  const color = getSeverityColor(severity);
  // console.log(color, severity);
  return (
    <span
      className={`mr-1 rounded-md p-[.35rem] text-xs font-semibold text-white ${color}`}
    >
      {severity}
    </span>
  );
};
