import { ReactNode } from "react";

export const GlassFeatureCard = ({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-white">{icon}</div>
        <div>
          <h3 className="heading-font text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-base text-indigo-100/90">{description}</p>
        </div>
      </div>
    </div>
  );
};
