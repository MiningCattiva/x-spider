import { PropsWithChildren, ReactNode, createContext, useContext } from 'react';
import { SettingFilled } from '@ant-design/icons';

export interface SectionProps extends PropsWithChildren {
  title: string;
  name: string;
  titleIcon?: ReactNode;
}

const context = createContext<Pick<SectionProps, 'name'>>({
  name: '',
});

export const Section: React.FC<SectionProps> = ({
  name,
  title,
  children,
  titleIcon = <SettingFilled />,
}) => {
  return (
    <context.Provider value={{ name }}>
      <section
        className="mb-4 bg-white p-4 border-[1px] rounded-md"
        aria-label={title}
      >
        <h2 className="font-bold text-xl mb-4 flex items-center">
          <span
            className="text-ant-color-primary transform translate-y-[1px]"
            aria-hidden
          >
            {titleIcon}
          </span>
          <span className="ml-2">{title}</span>
        </h2>
        {children}
      </section>
    </context.Provider>
  );
};

export function useSectionContext() {
  return useContext(context);
}
